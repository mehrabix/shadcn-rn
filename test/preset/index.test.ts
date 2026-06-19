import { describe, it, expect } from "vitest"
import { defaultPresets, getPreset, getPresetNames } from "../../src/preset"

describe("preset", () => {
  describe("defaultPresets", () => {
    it("should have default and new-york presets", () => {
      expect(defaultPresets).toHaveLength(2)
      expect(defaultPresets[0].name).toBe("default")
      expect(defaultPresets[1].name).toBe("new-york")
    })
  })

  describe("getPreset", () => {
    it("should return preset by name", () => {
      const preset = getPreset("default")
      expect(preset).toBeDefined()
      expect(preset?.name).toBe("default")
    })

    it("should return undefined for unknown preset", () => {
      const preset = getPreset("unknown")
      expect(preset).toBeUndefined()
    })
  })

  describe("getPresetNames", () => {
    it("should return all preset names", () => {
      const names = getPresetNames()
      expect(names).toContain("default")
      expect(names).toContain("new-york")
    })
  })
})
