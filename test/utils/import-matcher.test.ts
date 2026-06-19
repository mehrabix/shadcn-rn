import { describe, it, expect } from "vitest"
import { importMatcher, addImport, removeImport } from "../../src/utils/import-matcher"

describe("import-matcher", () => {
  describe("importMatcher", () => {
    it("should detect existing import", () => {
      const source = 'import { Button } from "@/components"'
      expect(importMatcher(source, "@/components")).toBe(true)
    })

    it("should return false for missing import", () => {
      const source = 'import { Button } from "@/components"'
      expect(importMatcher(source, "@/lib")).toBe(false)
    })
  })

  describe("addImport", () => {
    it("should add import after last import", () => {
      const source = 'import { Button } from "@/components"'
      const result = addImport(source, 'import { Card } from "@/card"')
      expect(result).toContain('import { Card } from "@/card"')
      expect(result.indexOf('import { Card }')).toBeGreaterThan(
        source.indexOf('import { Button }')
      )
    })

    it("should add import at top if no imports", () => {
      const source = "const x = 1"
      const result = addImport(source, 'import { Button } from "@/components"')
      expect(result.startsWith('import')).toBe(true)
    })
  })

  describe("removeImport", () => {
    it("should remove import by path", () => {
      const source = 'import { Button } from "@/components"\nconst x = 1'
      const result = removeImport(source, "@/components")
      expect(result).not.toContain("@/components")
      expect(result).toContain("const x = 1")
    })
  })
})
