import { describe, it, expect } from "vitest"
import {
  parseRegistryAndItemFromString,
  isRegistryItemString,
} from "../../src/registry/parser"

describe("parseRegistryAndItemFromString", () => {
  it("should parse @shadcn-rn/button", () => {
    const result = parseRegistryAndItemFromString("@shadcn-rn/button")
    expect(result).toEqual({
      registry: "@shadcn-rn",
      item: "button",
    })
  })

  it("should parse @custom/data-table", () => {
    const result = parseRegistryAndItemFromString("@custom/data-table")
    expect(result).toEqual({
      registry: "@custom",
      item: "data-table",
    })
  })

  it("should parse @scope/my-component", () => {
    const result = parseRegistryAndItemFromString("@scope/my-component")
    expect(result).toEqual({
      registry: "@scope",
      item: "my-component",
    })
  })

  it("should parse @scope/my-component-name", () => {
    const result = parseRegistryAndItemFromString("@scope/my-component-name")
    expect(result).toEqual({
      registry: "@scope",
      item: "my-component-name",
    })
  })

  it("should return null for invalid input without @", () => {
    const result = parseRegistryAndItemFromString("button")
    expect(result).toBeNull()
  })

  it("should return null for invalid input without slash", () => {
    const result = parseRegistryAndItemFromString("@shadcn-rn")
    expect(result).toBeNull()
  })

  it("should return null for invalid input with spaces", () => {
    const result = parseRegistryAndItemFromString("@shadcn-rn/button name")
    expect(result).toBeNull()
  })
})

describe("isRegistryItemString", () => {
  it("should return true for @scope/item", () => {
    expect(isRegistryItemString("@shadcn-rn/button")).toBe(true)
  })

  it("should return false for plain string", () => {
    expect(isRegistryItemString("button")).toBe(false)
  })

  it("should return false for URL", () => {
    expect(isRegistryItemString("https://example.com/button.json")).toBe(false)
  })

  it("should return false for file path", () => {
    expect(isRegistryItemString("./button.tsx")).toBe(false)
  })
})
