import { describe, it, expect } from "vitest"
import { tools, handleToolCall } from "../../src/mcp"

describe("mcp", () => {
  describe("tools", () => {
    it("should have add-component and list-components tools", () => {
      expect(tools).toHaveLength(2)
      expect(tools[0].name).toBe("add-component")
      expect(tools[1].name).toBe("list-components")
    })
  })

  describe("handleToolCall", () => {
    it("should handle add-component", async () => {
      const result = await handleToolCall("add-component", { name: "button" })
      expect(result).toEqual({ success: true, message: "Added component: button" })
    })

    it("should handle list-components", async () => {
      const result = await handleToolCall("list-components", {})
      expect(result).toHaveProperty("components")
    })

    it("should return error for unknown tool", async () => {
      const result = await handleToolCall("unknown", {})
      expect(result).toHaveProperty("error")
    })
  })
})
