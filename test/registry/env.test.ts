import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { expandEnvVars, extractEnvVars, hasEnvVars } from "../../src/registry/env"

describe("env", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("expandEnvVars", () => {
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

  describe("extractEnvVars", () => {
    it("should extract env vars from string", () => {
      const result = extractEnvVars("${API_KEY}")
      expect(result).toEqual(["API_KEY"])
    })

    it("should extract multiple env vars", () => {
      const result = extractEnvVars("${API_KEY}:${TOKEN}")
      expect(result).toEqual(["API_KEY", "TOKEN"])
    })

    it("should return empty array for no env vars", () => {
      const result = extractEnvVars("no vars here")
      expect(result).toEqual([])
    })
  })

  describe("hasEnvVars", () => {
    it("should return true for string with env vars", () => {
      expect(hasEnvVars("${API_KEY}")).toBe(true)
    })

    it("should return false for string without env vars", () => {
      expect(hasEnvVars("no vars here")).toBe(false)
    })
  })
})
