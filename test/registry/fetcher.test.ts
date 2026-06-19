import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchRegistry, clearCache } from "../../src/registry/fetcher"

describe("fetcher", () => {
  beforeEach(() => {
    clearCache()
    vi.restoreAllMocks()
  })

  describe("fetchRegistry", () => {
    it("should fetch registry items", async () => {
      const mockItem = {
        name: "button",
        type: "registry:ui",
        files: [{ path: "button.tsx", type: "registry:ui" as const, content: "test" }],
      }
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockItem),
      }))

      const items = await fetchRegistry(["https://example.com/button.json"])
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe("button")
    })

    it("should handle 404 errors", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }))

      await expect(
        fetchRegistry(["https://example.com/missing.json"])
      ).rejects.toThrow()
    })

    it("should handle fetch errors", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))

      await expect(
        fetchRegistry(["https://example.com/button.json"])
      ).rejects.toThrow()
    })
  })

  describe("clearCache", () => {
    it("should clear the cache", async () => {
      const mockItem = {
        name: "button",
        type: "registry:ui",
        files: [{ path: "button.tsx", type: "registry:ui" as const, content: "" }],
      }
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockItem),
      }))

      await fetchRegistry(["https://example.com/button.json"])
      clearCache()
      const items = await fetchRegistry(["https://example.com/button.json"])
      expect(items).toHaveLength(1)
    })
  })
})
