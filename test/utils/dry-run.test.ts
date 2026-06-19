import { describe, it, expect } from "vitest"
import { formatDryRunOutput } from "../../src/utils/dry-run"

describe("dry-run", () => {
  describe("formatDryRunOutput", () => {
    it("should format create files", () => {
      const files = [
        { path: "button.tsx", content: "", type: "create" as const },
      ]
      const result = formatDryRunOutput(files)
      expect(result).toContain("+ button.tsx")
    })

    it("should format update files", () => {
      const files = [
        { path: "button.tsx", content: "", type: "update" as const },
      ]
      const result = formatDryRunOutput(files)
      expect(result).toContain("~ button.tsx")
    })

    it("should format delete files", () => {
      const files = [
        { path: "button.tsx", content: "", type: "delete" as const },
      ]
      const result = formatDryRunOutput(files)
      expect(result).toContain("- button.tsx")
    })

    it("should handle multiple files", () => {
      const files = [
        { path: "a.tsx", content: "", type: "create" as const },
        { path: "b.tsx", content: "", type: "update" as const },
      ]
      const result = formatDryRunOutput(files)
      expect(result).toContain("+ a.tsx")
      expect(result).toContain("~ b.tsx")
    })
  })
})
