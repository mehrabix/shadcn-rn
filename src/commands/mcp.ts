import { promises as fs } from "fs"
import path from "path"
import { server } from "../mcp"
import { log, info, success, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { spinner } from "../utils/spinner"
import { Command } from "commander"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import deepmerge from "deepmerge"
import fsExtra from "fs-extra"
import { z } from "zod"

const SHADCN_MCP_VERSION = "latest"

const CLIENTS = [
  {
    name: "claude",
    label: "Claude Code",
    configPath: ".mcp.json",
    config: {
      mcpServers: {
        "shadcn-rn": {
          command: "npx",
          args: [`shadcn-rn@${SHADCN_MCP_VERSION}`, "mcp"],
        },
      },
    },
  },
  {
    name: "cursor",
    label: "Cursor",
    configPath: ".cursor/mcp.json",
    config: {
      mcpServers: {
        "shadcn-rn": {
          command: "npx",
          args: [`shadcn-rn@${SHADCN_MCP_VERSION}`, "mcp"],
        },
      },
    },
  },
  {
    name: "vscode",
    label: "VS Code",
    configPath: ".vscode/mcp.json",
    config: {
      servers: {
        "shadcn-rn": {
          command: "npx",
          args: [`shadcn-rn@${SHADCN_MCP_VERSION}`, "mcp"],
        },
      },
    },
  },
  {
    name: "opencode",
    label: "OpenCode",
    configPath: "opencode.json",
    config: {
      $schema: "https://opencode.ai/config.json",
      mcp: {
        "shadcn-rn": {
          type: "local",
          command: ["npx", `shadcn-rn@${SHADCN_MCP_VERSION}`, "mcp"],
          enabled: true,
        },
      },
    },
  },
] as const

export const mcp = new Command()
  .name("mcp")
  .description("MCP server and configuration commands")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async (opts) => {
    try {
      const transport = new StdioServerTransport()
      await server.connect(transport)
    } catch (err) {
      logError(`MCP server failed to start: ${err}`)
      process.exit(1)
    }
  })

const mcpInitOptionsSchema = z.object({
  client: z.enum(["claude", "cursor", "vscode", "opencode"]),
  cwd: z.string(),
})

mcp
  .command("init")
  .description("Initialize MCP configuration for your client")
  .option(
    "--client <client>",
    `MCP client (${CLIENTS.map((c) => c.name).join(", ")})`
  )
  .action(async (opts, command) => {
    try {
      const parentOpts = command.parent?.opts() || {}
      const cwd = parentOpts.cwd || process.cwd()

      let client = opts.client

      if (!client) {
        const prompts = (await import("prompts")).default
        const response = await prompts({
          type: "select",
          name: "client",
          message: "Which MCP client are you using?",
          choices: CLIENTS.map((c) => ({
            title: c.label,
            value: c.name,
          })),
        })

        if (!response.client) {
          process.exit(1)
        }

        client = response.client
      }

      const options = mcpInitOptionsSchema.parse({ client, cwd })

      const configSpinner = spinner("Configuring MCP server...").start()
      const configPath = await runMcpInit(options)
      configSpinner.succeed("Configuring MCP server.")

      success(`Configuration saved to ${highlighter.info(configPath)}.`)
      info("")
      info(`Restart your MCP client to load the server.`)
    } catch (err) {
      logError(`MCP init failed: ${err}`)
      process.exit(1)
    }
  })

const overwriteMerge = (_: unknown[], sourceArray: unknown[]) => sourceArray

async function runMcpInit(options: z.infer<typeof mcpInitOptionsSchema>) {
  const { client, cwd } = options

  const clientInfo = CLIENTS.find((c) => c.name === client)
  if (!clientInfo) {
    throw new Error(
      `Unknown client: ${client}. Available clients: ${CLIENTS.map(
        (c) => c.name
      ).join(", ")}`
    )
  }

  const configPath = path.join(cwd, clientInfo.configPath)
  const dir = path.dirname(configPath)
  await fsExtra.ensureDir(dir)

  let existingConfig = {}
  try {
    const content = await fs.readFile(configPath, "utf-8")
    existingConfig = JSON.parse(content)
  } catch {}

  const mergedConfig = deepmerge(
    existingConfig,
    clientInfo.config as Record<string, unknown>,
    { arrayMerge: overwriteMerge }
  )

  await fs.writeFile(
    configPath,
    JSON.stringify(mergedConfig, null, 2) + "\n",
    "utf-8"
  )

  return clientInfo.configPath
}
