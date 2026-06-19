import { describe, it, expect } from "vitest"
import { setRegistryHeaders, getRegistryHeadersFromContext, clearRegistryContext } from "../../src/registry/context"

describe("registry context", () => {
  it("should set and get headers", () => {
    clearRegistryContext()
    setRegistryHeaders({
      "https://example.com": { Authorization: "Bearer token" },
    })
    const headers = getRegistryHeadersFromContext("https://example.com")
    expect(headers).toEqual({ Authorization: "Bearer token" })
  })

  it("should return empty object for unknown URL", () => {
    clearRegistryContext()
    const headers = getRegistryHeadersFromContext("https://unknown.com")
    expect(headers).toEqual({})
  })

  it("should merge headers", () => {
    clearRegistryContext()
    setRegistryHeaders({
      "https://example.com": { Authorization: "Bearer token" },
    })
    setRegistryHeaders({
      "https://example.com": { "X-Custom": "value" },
    })
    const headers = getRegistryHeadersFromContext("https://example.com")
    expect(headers).toEqual({
      Authorization: "Bearer token",
      "X-Custom": "value",
    })
  })

  it("should clear context", () => {
    clearRegistryContext()
    setRegistryHeaders({
      "https://example.com": { Authorization: "Bearer token" },
    })
    clearRegistryContext()
    const headers = getRegistryHeadersFromContext("https://example.com")
    expect(headers).toEqual({})
  })
})
