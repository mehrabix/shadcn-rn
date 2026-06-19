import { describe, it, expect } from "vitest"
import { cn } from "../../src/lib/utils"

describe("cn", () => {
  it("should join class names", () => {
    const result = cn("class1", "class2")
    expect(result).toBe("class1 class2")
  })

  it("should filter falsy values", () => {
    const result = cn("class1", false, null, undefined, "class2")
    expect(result).toBe("class1 class2")
  })

  it("should handle empty input", () => {
    const result = cn()
    expect(result).toBe("")
  })

  it("should handle single class", () => {
    const result = cn("class1")
    expect(result).toBe("class1")
  })

  it("should handle undefined and null", () => {
    const result = cn("class1", undefined, null, "class2")
    expect(result).toBe("class1 class2")
  })
})
