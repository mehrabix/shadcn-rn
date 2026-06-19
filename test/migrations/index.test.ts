import { describe, it, expect } from "vitest"
import { migrations, runMigration, runAllMigrations } from "../../src/migrations"

describe("migrations", () => {
  describe("migrations", () => {
    it("should have icons and rtl migrations", () => {
      expect(migrations).toHaveLength(2)
      expect(migrations[0].name).toBe("icons")
      expect(migrations[1].name).toBe("rtl")
    })
  })

  describe("runMigration", () => {
    it("should run migration by name", async () => {
      const result = await runMigration("icons", "/tmp")
      expect(result).toBe(true)
    })

    it("should return false for unknown migration", async () => {
      const result = await runMigration("unknown", "/tmp")
      expect(result).toBe(false)
    })
  })

  describe("runAllMigrations", () => {
    it("should run all migrations", async () => {
      await expect(runAllMigrations("/tmp")).resolves.not.toThrow()
    })
  })
})
