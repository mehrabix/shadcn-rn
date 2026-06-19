import { describe, it, expect } from "vitest"
import { getPackageInfo, hasDependency } from "../../src/utils/get-package-info"

describe("get-package-info", () => {
  describe("getPackageInfo", () => {
    it("should extract package info", () => {
      const packageJson = {
        name: "test-package",
        version: "1.0.0",
        description: "A test package",
        dependencies: { react: "^18.0.0" },
        devDependencies: { typescript: "^5.0.0" },
      }
      const result = getPackageInfo(packageJson)
      expect(result.name).toBe("test-package")
      expect(result.version).toBe("1.0.0")
      expect(result.description).toBe("A test package")
      expect(result.dependencies).toEqual({ react: "^18.0.0" })
      expect(result.devDependencies).toEqual({ typescript: "^5.0.0" })
    })

    it("should handle missing fields", () => {
      const packageJson = {}
      const result = getPackageInfo(packageJson)
      expect(result.name).toBe("unknown")
      expect(result.version).toBe("0.0.0")
      expect(result.description).toBe("")
      expect(result.dependencies).toEqual({})
      expect(result.devDependencies).toEqual({})
    })
  })

  describe("hasDependency", () => {
    it("should return true for existing dependency", () => {
      const packageJson = {
        dependencies: { react: "^18.0.0" },
      }
      expect(hasDependency(packageJson, "react")).toBe(true)
    })

    it("should return true for existing devDependency", () => {
      const packageJson = {
        devDependencies: { typescript: "^5.0.0" },
      }
      expect(hasDependency(packageJson, "typescript")).toBe(true)
    })

    it("should return false for missing dependency", () => {
      const packageJson = {
        dependencies: { react: "^18.0.0" },
      }
      expect(hasDependency(packageJson, "vue")).toBe(false)
    })
  })
})
