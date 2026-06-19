import { describe, it, expect } from "vitest"
import { highlightCode } from "../../src/utils/highlighter"

describe("highlighter", () => {
  it("should export highlightCode function", () => {
    expect(typeof highlightCode).toBe("function")
  })

  it("should highlight code", () => {
    const result = highlightCode("const x = 1")
    expect(result).toContain("const")
  })
})
