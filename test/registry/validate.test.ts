import { describe, it, expect } from "vitest"
import { validateRegistry, validateRegistryItem } from "../../src/registry/validate"

describe("validateRegistry", () => {
  it("should validate a valid registry", () => {
    const result = validateRegistry({
      name: "test",
      homepage: "https://example.com",
      items: [
        {
          name: "button",
          type: "registry:ui",
          files: [
            {
              path: "components/ui/button.tsx",
              type: "registry:ui",
            },
          ],
        },
      ],
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it("should detect duplicate item names", () => {
    const result = validateRegistry({
      name: "test",
      homepage: "https://example.com",
      items: [
        {
          name: "button",
          type: "registry:ui",
        },
        {
          name: "button",
          type: "registry:ui",
        },
      ],
    })
    expect(result.valid).toBe(true)
    expect(result.warnings).toContainEqual("Duplicate item name: button")
  })

  it("should reject invalid registry", () => {
    const result = validateRegistry({
      name: "test",
    })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})

describe("validateRegistryItem", () => {
  it("should validate a valid item", () => {
    const result = validateRegistryItem({
      name: "button",
      type: "registry:ui",
      files: [
        {
          path: "components/ui/button.tsx",
          type: "registry:ui",
        },
      ],
    })
    expect(result.valid).toBe(true)
  })

  it("should reject item without name", () => {
    const result = validateRegistryItem({
      type: "registry:ui",
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual("Item must have a name")
  })
})
