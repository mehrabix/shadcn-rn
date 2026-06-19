import { describe, it, expect } from "vitest"
import { getTemplate, expoTemplate } from "../../src/utils/templates"

describe("templates", () => {
  describe("expoTemplate", () => {
    it("should have expo template", () => {
      expect(expoTemplate.name).toBe("expo")
      expect(expoTemplate.framework).toBe("expo")
      expect(expoTemplate.files).toHaveProperty("nativewind.config.js")
      expect(expoTemplate.files).toHaveProperty("tailwind.config.js")
      expect(expoTemplate.files).toHaveProperty("global.css")
    })
  })

  describe("getTemplate", () => {
    it("should return expo template", () => {
      const template = getTemplate("expo")
      expect(template).toBeDefined()
      expect(template?.name).toBe("expo")
    })

    it("should return null for unknown template", () => {
      const template = getTemplate("unknown")
      expect(template).toBeNull()
    })
  })
})
