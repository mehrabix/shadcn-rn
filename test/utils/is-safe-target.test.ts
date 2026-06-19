import { describe, it, expect } from "vitest"
import { isSafeTarget } from "../../src/utils/is-safe-target"

describe("isSafeTarget", () => {
  it("should allow safe paths", () => {
    expect(isSafeTarget("/project/src/button.tsx", "/project")).toBe(true)
  })

  it("should reject paths with ..", () => {
    expect(isSafeTarget("/project/src/../button.tsx", "/project")).toBe(false)
  })

  it("should reject paths outside cwd", () => {
    expect(isSafeTarget("/other/project/src/button.tsx", "/project")).toBe(false)
  })

  it("should allow paths at cwd root", () => {
    expect(isSafeTarget("/project/button.tsx", "/project")).toBe(true)
  })

  it("should handle Windows-style paths", () => {
    expect(isSafeTarget("C:\\project\\src\\button.tsx", "C:\\project")).toBe(true)
  })
})
