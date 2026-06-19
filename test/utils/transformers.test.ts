import { describe, it, expect } from "vitest"
import { transformImport, transformRsc, transformCssVars, transformTwPrefixes, transformCleanup } from "../../src/utils/transformers"

describe("transformers", () => {
  describe("transformImport", () => {
    it("should transform import paths", () => {
      const source = 'import { Button } from "@/components"'
      const result = transformImport(source, {
        aliases: { components: "~/components" },
        style: "default",
        tsx: true,
      })
      expect(result).toContain('from "~/components"')
    })

    it("should handle multiple aliases", () => {
      const source = 'import { cn } from "@/lib"'
      const result = transformImport(source, {
        aliases: { lib: "~/lib" },
        style: "default",
        tsx: true,
      })
      expect(result).toContain('from "~/lib"')
    })
  })

  describe("transformRsc", () => {
    it("should add use client directive", () => {
      const source = "export default function Component() {}"
      const result = transformRsc(source, { rsc: true })
      expect(result).toContain('"use client"')
    })

    it("should remove use client directive", () => {
      const source = '"use client"\n\nexport default function Component() {}'
      const result = transformRsc(source, { rsc: false })
      expect(result).not.toContain('"use client"')
    })
  })

  describe("transformCssVars", () => {
    it("should replace CSS variables", () => {
      const source = "color: var(--primary)"
      const result = transformCssVars(source, { primary: "#000" })
      expect(result).toContain("color: #000")
    })
  })

  describe("transformTwPrefixes", () => {
    it("should add prefix to classes", () => {
      const source = 'className="bg-primary text-white"'
      const result = transformTwPrefixes(source, "tw-")
      expect(result).toContain("tw-bg-primary")
    })

    it("should not add prefix if already present", () => {
      const source = 'className="tw-bg-primary"'
      const result = transformTwPrefixes(source, "tw-")
      expect(result).toContain("tw-bg-primary")
    })

    it("should return unchanged if no prefix", () => {
      const source = 'className="bg-primary"'
      const result = transformTwPrefixes(source, "")
      expect(result).toBe(source)
    })
  })

  describe("transformCleanup", () => {
    it("should remove TODO comments", () => {
      const source = "// TODO: fix this\nconst x = 1"
      const result = transformCleanup(source)
      expect(result).not.toContain("TODO")
    })

    it("should keep regular comments", () => {
      const source = "// This is a comment\nconst x = 1"
      const result = transformCleanup(source)
      expect(result).toContain("This is a comment")
    })
  })
})
