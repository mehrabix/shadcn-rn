import { describe, it, expect } from "vitest"
import { server } from "../../src/mcp"

describe("mcp", () => {
  describe("server", () => {
    it("should export a server instance", () => {
      expect(server).toBeDefined()
    })

    it("should be an object with setRequestHandler", () => {
      expect(typeof server.setRequestHandler).toBe("function")
    })
  })
})
