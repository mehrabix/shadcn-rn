import { describe, it, expect, vi } from "vitest"
import { searchRegistries } from "../../src/registry/search"

describe("search", () => {
  describe("searchRegistries", () => {
    it("should search registries", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([
          { name: "button", type: "registry:ui", description: "A button" },
          { name: "card", type: "registry:ui", description: "A card" },
        ]),
      }))

      const results = await searchRegistries(["@shadcn"], { query: "button" })
      expect(results.items.length).toBeGreaterThan(0)
      expect(results.items[0].name).toBe("button")
    })

    it("should handle empty results", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      }))

      const results = await searchRegistries(["@shadcn"], { query: "nonexistent" })
      expect(results.items).toHaveLength(0)
    })

    it("should handle pagination", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([
          { name: "item1", type: "registry:ui" },
          { name: "item2", type: "registry:ui" },
          { name: "item3", type: "registry:ui" },
        ]),
      }))

      const results = await searchRegistries(["@shadcn"], { query: "item", limit: 2, offset: 0 })
      expect(results.items).toHaveLength(2)
      expect(results.pagination.hasMore).toBe(true)
    })

    it("should handle fetch errors", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
      const results = await searchRegistries(["@shadcn"], { query: "button", continueOnError: true })
      expect(results.items).toHaveLength(0)
      expect(results.errors).toHaveLength(1)
    })
  })
})
