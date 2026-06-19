import { describe, it, expect } from "vitest"
import {
  extractEnvVarsFromRegistryConfig,
  validateRegistryConfig,
} from "../../src/registry/validator"

describe("extractEnvVarsFromRegistryConfig", () => {
  it("should extract env vars from string registry config", () => {
    const result = extractEnvVarsFromRegistryConfig({
      registries: {
        "@custom": "https://example.com/${API_KEY}/{name}.json",
      },
    })
    expect(result.vars.has("API_KEY")).toBe(true)
  })

  it("should extract env vars from object registry config", () => {
    const result = extractEnvVarsFromRegistryConfig({
      registries: {
        "@custom": {
          url: "https://example.com/${API_KEY}/{name}.json",
          headers: { Authorization: "Bearer ${TOKEN}" },
        },
      },
    })
    expect(result.vars.has("API_KEY")).toBe(true)
    expect(result.vars.has("TOKEN")).toBe(true)
  })

  it("should return empty set for no env vars", () => {
    const result = extractEnvVarsFromRegistryConfig({
      registries: {
        "@custom": "https://example.com/{name}.json",
      },
    })
    expect(result.vars.size).toBe(0)
  })

  it("should track sources", () => {
    const result = extractEnvVarsFromRegistryConfig({
      registries: {
        "@custom": "https://example.com/${API_KEY}/{name}.json",
      },
    })
    expect(result.sources.length).toBeGreaterThan(0)
    expect(result.sources[0]).toContain("@custom")
  })
})

describe("validateRegistryConfig", () => {
  it("should return valid for config without env vars", () => {
    const result = validateRegistryConfig({
      registries: {
        "@custom": "https://example.com/{name}.json",
      },
    })
    expect(result.valid).toBe(true)
    expect(result.missing).toEqual([])
  })

  it("should return valid when env vars are set", () => {
    process.env.API_KEY = "key123"
    const result = validateRegistryConfig({
      registries: {
        "@custom": "https://example.com/${API_KEY}/{name}.json",
      },
    })
    expect(result.valid).toBe(true)
    expect(result.missing).toEqual([])
  })

  it("should return invalid when env vars are missing", () => {
    delete process.env.MISSING_KEY
    const result = validateRegistryConfig({
      registries: {
        "@custom": "https://example.com/${MISSING_KEY}/{name}.json",
      },
    })
    expect(result.valid).toBe(false)
    expect(result.missing).toContain("MISSING_KEY")
  })
})
