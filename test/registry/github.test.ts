import { describe, it, expect } from "vitest"
import { parseGitHubUrl } from "../../src/registry/github-ref"

describe("github", () => {
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

    it("should parse GitHub URL with .git suffix", () => {
      const result = parseGitHubUrl("https://github.com/user/repo.git")
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

    it("should return null for invalid URL", () => {
      const result = parseGitHubUrl("not-a-url")
      expect(result).toBeNull()
    })
  })
})
