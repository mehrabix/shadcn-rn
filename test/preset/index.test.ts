import { describe, it, expect } from "vitest"
import { DEFAULT_PRESETS } from "../../src/preset/defaults"

describe("preset", () => {
  describe("DEFAULT_PRESETS", () => {
    it("should have multiple presets", () => {
      const presetNames = Object.keys(DEFAULT_PRESETS)
      expect(presetNames.length).toBeGreaterThan(0)
    })

    it("should have nova-neutral preset", () => {
      expect(DEFAULT_PRESETS["nova-neutral"]).toBeDefined()
      expect(DEFAULT_PRESETS["nova-neutral"].title).toBe("Nova Neutral")
      expect(DEFAULT_PRESETS["nova-neutral"].style).toBe("nova")
      expect(DEFAULT_PRESETS["nova-neutral"].baseColor).toBe("neutral")
    })

    it("should have vega-zinc preset", () => {
      expect(DEFAULT_PRESETS["vega-zinc"]).toBeDefined()
      expect(DEFAULT_PRESETS["vega-zinc"].title).toBe("Vega Zinc")
    })
  })
})
