import { describe, it, expect } from "vitest"
import { isUrl, isLocalFile, isGitHubUrl, deduplicateFilesByTarget } from "../../src/registry/utils"

describe("registry utils", () => {
  describe("isUrl", () => {
    it("should return true for HTTP URL", () => {
      expect(isUrl("http://example.com")).toBe(true)
    })

    it("should return true for HTTPS URL", () => {
      expect(isUrl("https://example.com")).toBe(true)
    })

    it("should return false for local path", () => {
      expect(isUrl("/path/to/file")).toBe(false)
    })

    it("should return false for relative path", () => {
      expect(isUrl("./file.tsx")).toBe(false)
    })
  })

  describe("isLocalFile", () => {
    it("should return true for absolute path", () => {
      expect(isLocalFile("/path/to/file")).toBe(true)
    })

    it("should return true for relative path", () => {
      expect(isLocalFile("./file.tsx")).toBe(true)
    })

    it("should return true for home path", () => {
      expect(isLocalFile("~/file.tsx")).toBe(true)
    })

    it("should return true for parent path", () => {
      expect(isLocalFile("../file.tsx")).toBe(true)
    })

    it("should return false for URL", () => {
      expect(isLocalFile("https://example.com")).toBe(false)
    })
  })

  describe("isGitHubUrl", () => {
    it("should return true for GitHub URL", () => {
      expect(isGitHubUrl("https://github.com/user/repo")).toBe(true)
    })

    it("should return true for short GitHub URL", () => {
      expect(isGitHubUrl("github.com/user/repo")).toBe(true)
    })

    it("should return false for non-GitHub URL", () => {
      expect(isGitHubUrl("https://example.com")).toBe(false)
    })
  })

  describe("deduplicateFilesByTarget", () => {
    it("should deduplicate by target path", () => {
      const files = [
        { path: "a.tsx", target: "components/a.tsx", content: "a" },
        { path: "b.tsx", target: "components/b.tsx", content: "b" },
        { path: "a2.tsx", target: "components/a.tsx", content: "a2" },
      ]
      const result = deduplicateFilesByTarget(files)
      expect(result).toHaveLength(2)
      expect(result[0].content).toBe("a2")
      expect(result[1].content).toBe("b")
    })

    it("should deduplicate by path when no target", () => {
      const files = [
        { path: "components/a.tsx", content: "a" },
        { path: "components/b.tsx", content: "b" },
        { path: "components/a.tsx", content: "a2" },
      ]
      const result = deduplicateFilesByTarget(files)
      expect(result).toHaveLength(2)
    })
  })
})
