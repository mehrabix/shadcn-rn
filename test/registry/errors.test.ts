import { describe, it, expect } from "vitest"
import { RegistryError, RegistryErrorCode, RegistryNotFoundError, RegistryUnauthorizedError, RegistryForbiddenError, ConfigMissingError } from "../../src/registry/errors"

describe("RegistryError", () => {
  it("should create error with code and message", () => {
    const error = new RegistryError("Test error", RegistryErrorCode.NOT_FOUND)
    expect(error.message).toBe("Test error")
    expect(error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(error.name).toBe("RegistryError")
  })

  it("should create error with options", () => {
    const error = new RegistryError("Test error", RegistryErrorCode.FETCH_ERROR, {
      statusCode: 500,
      context: { url: "https://example.com" },
      suggestion: "Check the URL",
    })
    expect(error.statusCode).toBe(500)
    expect(error.context).toEqual({ url: "https://example.com" })
    expect(error.suggestion).toBe("Check the URL")
  })
})

describe("RegistryNotFoundError", () => {
  it("should create error with item name", () => {
    const error = new RegistryNotFoundError("button")
    expect(error.message).toContain("button")
    expect(error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(error.statusCode).toBe(404)
  })

  it("should include registry in context", () => {
    const error = new RegistryNotFoundError("button", { registry: "@custom" })
    expect(error.context).toEqual({ itemName: "button", registry: "@custom" })
  })
})

describe("RegistryUnauthorizedError", () => {
  it("should create error with URL", () => {
    const error = new RegistryUnauthorizedError("https://example.com")
    expect(error.message).toContain("https://example.com")
    expect(error.code).toBe(RegistryErrorCode.UNAUTHORIZED)
    expect(error.statusCode).toBe(401)
  })
})

describe("RegistryForbiddenError", () => {
  it("should create error with URL", () => {
    const error = new RegistryForbiddenError("https://example.com")
    expect(error.message).toContain("https://example.com")
    expect(error.code).toBe(RegistryErrorCode.FORBIDDEN)
    expect(error.statusCode).toBe(403)
  })
})

describe("ConfigMissingError", () => {
  it("should create error with path", () => {
    const error = new ConfigMissingError("/path/to/project")
    expect(error.message).toContain("/path/to/project")
    expect(error.code).toBe(RegistryErrorCode.CONFIG_MISSING)
    expect(error.suggestion).toContain("init")
  })
})
