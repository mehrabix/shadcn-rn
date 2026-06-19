export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export const tools: McpTool[] = [
  {
    name: "add-component",
    description: "Add a component to the project",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The component name to add",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "list-components",
    description: "List available components",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
]

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "add-component":
      return { success: true, message: `Added component: ${args.name}` }
    case "list-components":
      return { components: ["button", "card", "input", "badge"] }
    default:
      return { error: `Unknown tool: ${name}` }
  }
}
