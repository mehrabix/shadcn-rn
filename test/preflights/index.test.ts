import { describe, it, expect } from "vitest"
import { preflightAdd, preflightInit, preflightBuild } from "../../src/preflights"

describe("preflights", () => {
  describe("preflightAdd", () => {
    it("should return issues for missing package.json", async () => {
      const result = await preflightAdd("/nonexistent")
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })
  })

  describe("preflightInit", () => {
    it("should return issues for missing package.json", async () => {
      const result = await preflightInit("/nonexistent")
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })
  })

  describe("preflightBuild", () => {
    it("should return issues for missing registry.json", async () => {
      const result = await preflightBuild("/nonexistent")
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })
  })
})
