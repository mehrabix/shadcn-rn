import { describe, it, expect, vi, beforeEach } from "vitest"
import { topologicalSortRegistryItems } from "../../src/registry/resolver"

describe("resolver - topologicalSortRegistryItems", () => {
  it("should sort items with no dependencies", () => {
    const items = [
      { name: "b", type: "registry:ui" as const },
      { name: "a", type: "registry:ui" as const },
    ]
    const sorted = topologicalSortRegistryItems(items)
    expect(sorted.map((i) => i.name)).toEqual(["b", "a"])
  })

  it("should sort items with dependencies first", () => {
    const items = [
      { name: "button", type: "registry:ui" as const, registryDependencies: ["icon"] },
      { name: "icon", type: "registry:ui" as const },
    ]
    const sorted = topologicalSortRegistryItems(items)
    const iconIndex = sorted.findIndex((i) => i.name === "icon")
    const buttonIndex = sorted.findIndex((i) => i.name === "button")
    expect(iconIndex).toBeLessThan(buttonIndex)
  })

  it("should handle circular dependencies gracefully", () => {
    const items = [
      { name: "a", type: "registry:ui" as const, registryDependencies: ["b"] },
      { name: "b", type: "registry:ui" as const, registryDependencies: ["a"] },
    ]
    const sorted = topologicalSortRegistryItems(items)
    expect(sorted).toHaveLength(2)
  })

  it("should handle empty items", () => {
    const sorted = topologicalSortRegistryItems([])
    expect(sorted).toEqual([])
  })
})
