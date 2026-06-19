import { describe, it, expect } from "vitest"
import { log, info, success, warn, error, bold } from "../../src/utils/logger"

describe("logger", () => {
  it("should export log function", () => {
    expect(typeof log).toBe("function")
  })

  it("should export info function", () => {
    expect(typeof info).toBe("function")
  })

  it("should export success function", () => {
    expect(typeof success).toBe("function")
  })

  it("should export warn function", () => {
    expect(typeof warn).toBe("function")
  })

  it("should export error function", () => {
    expect(typeof error).toBe("function")
  })

  it("should export bold function", () => {
    expect(typeof bold).toBe("function")
  })

  it("bold should wrap text with ANSI codes", () => {
    const result = bold("test")
    expect(result).toContain("test")
    expect(result).not.toBe("test")
  })
})
