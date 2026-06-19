import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  buildUrlAndHeadersForRegistryItem,
  expandEnvVars,
  buildUrlFromRegistryConfig,
  buildHeadersFromRegistryConfig,
} from "../../src/registry/builder"

describe("expandEnvVars", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should expand ${VAR} syntax", () => {
    process.env.TEST_TOKEN = "abc123"
    const result = expandEnvVars("Bearer ${TEST_TOKEN}")
    expect(result).toBe("Bearer abc123")
  })

  it("should return empty string for missing env var", () => {
    delete process.env.MISSING_VAR
    const result = expandEnvVars("${MISSING_VAR}")
    expect(result).toBe("")
  })

  it("should handle multiple env vars", () => {
    process.env.USER = "admin"
    process.env.PASS = "secret"
    const result = expandEnvVars("${USER}:${PASS}")
    expect(result).toBe("admin:secret")
  })

  it("should return string unchanged if no env vars", () => {
    const result = expandEnvVars("no vars here")
    expect(result).toBe("no vars here")
  })
})

describe("buildUrlAndHeadersForRegistryItem", () => {
  const registries: Record<string, string | { url: string; params?: Record<string, string>; headers?: Record<string, string> }> = {
    "@shadcn-rn": "https://registry.example.com/{name}.json",
    "@custom": {
      url: "https://custom.example.com/{name}.json",
      headers: { "X-Api-Key": "key123" },
    },
    "@params": {
      url: "https://params.example.com/{name}.json",
      params: { version: "1.0" },
    },
  }

  it("should build URL for string registry config", () => {
    const result = buildUrlAndHeadersForRegistryItem("@shadcn-rn/button", registries)
    expect(result).toEqual({
      url: "https://registry.example.com/button.json",
      headers: {},
    })
  })

  it("should build URL with headers for object registry config", () => {
    const result = buildUrlAndHeadersForRegistryItem("@custom/button", registries)
    expect(result).toEqual({
      url: "https://custom.example.com/button.json",
      headers: { "X-Api-Key": "key123" },
    })
  })

  it("should build URL with params for object registry config", () => {
    const result = buildUrlAndHeadersForRegistryItem("@params/button", registries)
    expect(result).toEqual({
      url: "https://params.example.com/button.json?version=1.0",
      headers: {},
    })
  })

  it("should return null for unknown registry", () => {
    const result = buildUrlAndHeadersForRegistryItem("@unknown/button", registries)
    expect(result).toBeNull()
  })

  it("should return null for input without @", () => {
    const result = buildUrlAndHeadersForRegistryItem("button", registries)
    expect(result).toBeNull()
  })
})

describe("buildUrlFromRegistryConfig", () => {
  it("should replace {name} placeholder", () => {
    const result = buildUrlFromRegistryConfig(
      "https://example.com/{name}.json",
      "button"
    )
    expect(result).toBe("https://example.com/button.json")
  })

  it("should replace {style} placeholder", () => {
    const result = buildUrlFromRegistryConfig(
      "https://example.com/styles/{style}/{name}.json",
      "button",
      "new-york"
    )
    expect(result).toBe("https://example.com/styles/new-york/button.json")
  })

  it("should use default style if not provided", () => {
    const result = buildUrlFromRegistryConfig(
      "https://example.com/styles/{style}/{name}.json",
      "button"
    )
    expect(result).toBe("https://example.com/styles/default/button.json")
  })

  it("should expand env vars in URL", () => {
    process.env.API_KEY = "key123"
    const result = buildUrlFromRegistryConfig(
      "https://example.com/${API_KEY}/{name}.json",
      "button"
    )
    expect(result).toBe("https://example.com/key123/button.json")
  })
})

describe("buildHeadersFromRegistryConfig", () => {
  it("should return empty object for undefined config", () => {
    const result = buildHeadersFromRegistryConfig(undefined)
    expect(result).toEqual({})
  })

  it("should return empty object for empty headers", () => {
    const result = buildHeadersFromRegistryConfig({ headers: {} })
    expect(result).toEqual({})
  })

  it("should expand env vars in headers", () => {
    process.env.API_KEY = "key123"
    const result = buildHeadersFromRegistryConfig({
      headers: { Authorization: "Bearer ${API_KEY}" },
    })
    expect(result).toEqual({
      Authorization: "Bearer key123",
    })
  })

  it("should skip empty env vars", () => {
    delete process.env.MISSING_KEY
    const result = buildHeadersFromRegistryConfig({
      headers: { Authorization: "${MISSING_KEY}" },
    })
    expect(result).toEqual({})
  })
})
