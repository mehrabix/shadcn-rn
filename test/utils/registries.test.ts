import { describe, it, expect } from "vitest"
import { ensureRegistry, getRegistryUrl } from "../../src/utils/registries"

describe("registries", () => {
  describe("ensureRegistry", () => {
    it("should add registry if missing", () => {
      const config: Record<string, unknown> = {}
      const result = ensureRegistry(config, "@custom")
      expect(result.registries).toHaveProperty("@custom")
    })

    it("should not overwrite existing registry", () => {
      const config: Record<string, unknown> = {
        registries: { "@custom": "https://existing.com/{name}.json" },
      }
      const result = ensureRegistry(config, "@custom")
      expect((result.registries as Record<string, string>)["@custom"]).toBe(
        "https://existing.com/{name}.json"
      )
    })
  })

  describe("getRegistryUrl", () => {
    it("should return registry URL", () => {
      const config: Record<string, unknown> = {
        registries: { "@custom": "https://example.com/{name}.json" },
      }
      const result = getRegistryUrl(config, "@custom")
      expect(result).toBe("https://example.com/{name}.json")
    })

    it("should return null for missing registry", () => {
      const config: Record<string, unknown> = {}
      const result = getRegistryUrl(config, "@custom")
      expect(result).toBeNull()
    })
  })
})
