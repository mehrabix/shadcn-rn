import { log, info } from "../utils/logger"

export interface McpOptions {
  cwd: string
}

export async function mcp(options: McpOptions): Promise<void> {
  const { cwd } = options

  log("Starting MCP server...")

  try {
    const { createMcpServer } = await import("../mcp")
    const server = createMcpServer({ cwd })
    await server.connect()
    info("MCP server started and listening")
  } catch {
    info("MCP server not available")
  }
}
