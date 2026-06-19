import { describe, it, expect } from "vitest"
import { resolveAliasDefaults, createAliasConfig } from "../../src/utils/alias"

describe("alias", () => {
  describe("resolveAliasDefaults", () => {
    it("should return default aliases for expo", () => {
      const result = resolveAliasDefaults("expo")
      expect(result.components).toBe("@/src/components")
      expect(result.utils).toBe("@/src/lib/utils")
      expect(result.ui).toBe("@/src/components/ui")
      expect(result.lib).toBe("@/src/lib")
      expect(result.hooks).toBe("@/src/hooks")
    })

    it("should return aliases with src prefix when srcDir is true", () => {
      const result = resolveAliasDefaults("expo", true)
      expect(result.components).toBe("@/src/components")
    })

    it("should return aliases without src prefix when srcDir is false", () => {
      const result = resolveAliasDefaults("expo", false)
      expect(result.components).toBe("@/components")
    })
  })

  describe("createAliasConfig", () => {
    it("should create config with defaults", () => {
      const result = createAliasConfig()
      expect(result.components).toBeDefined()
      expect(result.utils).toBeDefined()
    })

    it("should override defaults with provided values", () => {
      const result = createAliasConfig({
        components: "~/components",
      })
      expect(result.components).toBe("~/components")
      expect(result.utils).toBe("@/src/lib/utils")
    })
  })
})
