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
    info("MCP server started")
  } catch {
    info("MCP server not available")
  }
}
