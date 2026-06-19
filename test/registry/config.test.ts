import { describe, it, expect } from "vitest"
import { configWithDefaults } from "../../src/registry/config"

describe("configWithDefaults", () => {
  it("should add built-in registries", () => {
    const result = configWithDefaults({})
    expect(result.registries["@shadcn"]).toBeDefined()
    expect(result.registries["@shadcn"]).toContain("{name}.json")
  })

  it("should preserve custom registries", () => {
    const result = configWithDefaults({
      registries: {
        "@custom": "https://custom.example.com/{name}.json",
      },
    })
    expect(result.registries["@custom"]).toBe(
      "https://custom.example.com/{name}.json"
    )
    expect(result.registries["@shadcn"]).toBeDefined()
  })

  it("should override built-in registries with custom ones", () => {
    const result = configWithDefaults({
      registries: {
        "@shadcn": "https://custom-registry.com/{name}.json",
      },
    })
    expect(result.registries["@shadcn"]).toBe(
      "https://custom-registry.com/{name}.json"
    )
  })

  it("should handle empty registries", () => {
    const result = configWithDefaults({
      registries: {},
    })
    expect(result.registries["@shadcn"]).toBeDefined()
  })
})
