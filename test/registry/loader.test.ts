import { describe, it, expect, vi, beforeEach } from "vitest"
import { loadRegistry, loadRegistryItem } from "../../src/registry/loader"
import * as fs from "fs/promises"

vi.mock("fs/promises")

describe("loader", () => {
  const mockFs = vi.mocked(fs)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("loadRegistry", () => {
    it("should load valid registry", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        name: "test",
        homepage: "https://example.com",
        items: [],
      }))
      const registry = await loadRegistry({ cwd: "/test" })
      expect(registry.name).toBe("test")
      expect(registry.homepage).toBe("https://example.com")
      expect(registry.items).toEqual([])
    })

    it("should override include from options", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        name: "test",
        homepage: "https://example.com",
        items: [],
      }))
      const registry = await loadRegistry({ cwd: "/test", include: ["a.json"] })
      expect(registry).toBeDefined()
    })

    it("should throw on invalid registry", async () => {
      mockFs.readFile.mockResolvedValue("not json")
      await expect(loadRegistry({ cwd: "/test" })).rejects.toThrow()
    })

    it("should throw on missing required fields", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        name: "test",
      }))
      await expect(loadRegistry({ cwd: "/test" })).rejects.toThrow()
    })
  })

  describe("loadRegistryItem", () => {
    it("should load registry item", async () => {
      const mockItem = {
        name: "button",
        type: "registry:ui",
        files: [{ path: "button.tsx", type: "registry:ui", content: "test" }],
      }
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockItem))
      const item = await loadRegistryItem("button", { cwd: "/test" })
      expect(item.name).toBe("button")
    })
  })
})
