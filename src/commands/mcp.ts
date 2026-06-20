import path from "path"
import { log, info, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const mcpOptionsSchema = z.object({
  cwd: z.string(),
})

export const mcp = new Command()
  .name("mcp")
  .description("start the MCP server or manage MCP configuration")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async (opts) => {
    try {
      const options = mcpOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      log("Starting MCP server...")

      const { createMcpServer } = await import("../mcp")
      const server = createMcpServer({ cwd: options.cwd })
      await server.connect()

      info("MCP server started and listening")
      info(`Press Ctrl+C to stop`)
    } catch (err) {
      logError(`MCP server failed to start: ${err}`)
      process.exit(1)
    }
  })
