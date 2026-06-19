import { describe, it, expect } from "vitest"
import { createStyleMap, applyStyleMap, transformStyleMap, transform } from "../../src/styles"

describe("styles", () => {
  describe("createStyleMap", () => {
    it("should create style map from CSS", () => {
      const css = ".btn { color: red; }"
      const result = createStyleMap(css)
      expect(result).toEqual({ btn: "color: red;" })
    })

    it("should handle multiple classes on separate lines", () => {
      const css = ".btn { color: red; }\n.text { font-size: 14px; }"
      const result = createStyleMap(css)
      expect(result).toEqual({
        btn: "color: red;",
        text: "font-size: 14px;",
      })
    })

    it("should return empty object for empty CSS", () => {
      const result = createStyleMap("")
      expect(result).toEqual({})
    })
  })

  describe("applyStyleMap", () => {
    it("should apply styles to source code", () => {
      const source = 'className="btn"'
      const styleMap = { btn: "color: red;" }
      const result = applyStyleMap(source, styleMap)
      expect(result).toContain("color: red;")
    })
  })

  describe("transformStyleMap", () => {
    it("should transform source with CSS", () => {
      const source = 'className="btn"'
      const css = ".btn { color: red; }"
      const result = transformStyleMap(source, css)
      expect(result).toContain("color: red;")
    })
  })

  describe("transform", () => {
    it("should transform source with CSS", () => {
      const source = 'className="btn"'
      const css = ".btn { color: red; }"
      const result = transform(source, css)
      expect(result).toContain("color: red;")
    })
  })
})
