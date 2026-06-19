import { describe, it, expect } from "vitest"
import { iconLibraries, getIconLibrary, getIconLibraryNames } from "../../src/icons"

describe("icons", () => {
  describe("iconLibraries", () => {
    it("should have lucide and react-native-vector-icons", () => {
      expect(iconLibraries).toHaveProperty("lucide")
      expect(iconLibraries).toHaveProperty("react-native-vector-icons")
    })
  })

  describe("getIconLibrary", () => {
    it("should return library by name", () => {
      const lib = getIconLibrary("lucide")
      expect(lib).toBeDefined()
      expect(lib?.name).toBe("lucide-react-native")
    })

    it("should return undefined for unknown library", () => {
      const lib = getIconLibrary("unknown")
      expect(lib).toBeUndefined()
    })
  })

  describe("getIconLibraryNames", () => {
    it("should return all library names", () => {
      const names = getIconLibraryNames()
      expect(names).toContain("lucide")
      expect(names).toContain("react-native-vector-icons")
    })
  })
})
