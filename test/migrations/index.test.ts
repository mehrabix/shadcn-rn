import { describe, it, expect } from "vitest"
import { migrations, runMigration, runAllMigrations } from "../../src/migrations"

describe("migrations", () => {
  describe("migrations", () => {
    it("should have icons, rtl, and radix migrations", () => {
      expect(migrations).toHaveLength(3)
      expect(migrations[0].name).toBe("icons")
      expect(migrations[1].name).toBe("rtl")
      expect(migrations[2].name).toBe("radix")
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
