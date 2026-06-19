import { describe, it, expect } from "vitest"
import { preflightAdd, preflightInit, preflightBuild } from "../../src/preflights"

describe("preflights", () => {
  describe("preflightAdd", () => {
    it("should fail for missing package.json", async () => {
      const result = await preflightAdd("/nonexistent")
      expect(result.passed).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })

  describe("preflightInit", () => {
    it("should fail for missing package.json", async () => {
      const result = await preflightInit("/nonexistent")
      expect(result.passed).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })

  describe("preflightBuild", () => {
    it("should fail for missing registry.json", async () => {
      const result = await preflightBuild("/nonexistent")
      expect(result.passed).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })
})
