import { describe, it, expect } from "vitest"
import { createSpinner } from "../../src/utils/spinner"

describe("spinner", () => {
  describe("createSpinner", () => {
    it("should create spinner with text", () => {
      const spinner = createSpinner("Loading...")
      expect(spinner).toBeDefined()
      expect(typeof spinner.start).toBe("function")
      expect(typeof spinner.stop).toBe("function")
      expect(typeof spinner.succeed).toBe("function")
      expect(typeof spinner.fail).toBe("function")
    })

    it("should return spinner from methods", () => {
      const spinner = createSpinner("Loading...")
      const result = spinner.start()
      expect(result).toBe(spinner)
    })
  })
})
