import { describe, it, expect } from "vitest"
import { parseGitHubUrl, resolveGitHubRef } from "../../src/registry/github-ref"

describe("github-ref", () => {
  describe("parseGitHubUrl", () => {
    it("should parse GitHub URL with branch", () => {
      const result = parseGitHubUrl("https://github.com/user/repo/tree/main")
      expect(result).toEqual({
        owner: "user",
        repo: "repo",
        ref: "main",
      })
    })

    it("should parse GitHub URL with tag", () => {
      const result = parseGitHubUrl("https://github.com/user/repo/tree/v1.0.0")
      expect(result).toEqual({
        owner: "user",
        repo: "repo",
        ref: "v1.0.0",
      })
    })

    it("should parse GitHub URL without ref", () => {
      const result = parseGitHubUrl("https://github.com/user/repo")
      expect(result).toEqual({
        owner: "user",
        repo: "repo",
        ref: "main",
      })
    })

    it("should parse short GitHub URL", () => {
      const result = parseGitHubUrl("github.com/user/repo")
      expect(result).toEqual({
        owner: "user",
        repo: "repo",
        ref: "main",
      })
    })

    it("should return null for non-GitHub URL", () => {
      const result = parseGitHubUrl("https://example.com")
      expect(result).toBeNull()
    })
  })

  describe("resolveGitHubRef", () => {
    it("should return ref if it's a full SHA", () => {
      const sha = "a".repeat(40)
      const result = resolveGitHubRef("user", "repo", sha)
      expect(result).resolves.toBe(sha)
    })

    it("should return default ref if not provided", () => {
      const result = resolveGitHubRef("user", "repo")
      expect(result).resolves.toBe("main")
    })
  })
})
