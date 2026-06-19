import { describe, it, expect } from "vitest"
import { resolveItemAddress } from "../../src/registry/address"

describe("resolveItemAddress", () => {
  const registries = {
    "@shadcn-rn": "https://example.com/{name}.json",
    "@custom": "https://custom.example.com/{name}.json",
  }

  it("should resolve HTTP URL", () => {
    const result = resolveItemAddress("https://example.com/button.json", registries)
    expect(result).toEqual({
      scheme: "url",
      item: "https://example.com/button.json",
      url: "https://example.com/button.json",
    })
  })

  it("should resolve HTTPS URL", () => {
    const result = resolveItemAddress("https://example.com/button.json", registries)
    expect(result.scheme).toBe("url")
  })

  it("should resolve file path starting with /", () => {
    const result = resolveItemAddress("/path/to/button.tsx", registries)
    expect(result).toEqual({
      scheme: "file",
      item: "/path/to/button.tsx",
      filePath: "/path/to/button.tsx",
    })
  })

  it("should resolve file path starting with ~/", () => {
    const result = resolveItemAddress("~/components/button.tsx", registries)
    expect(result).toEqual({
      scheme: "file",
      item: "~/components/button.tsx",
      filePath: "~/components/button.tsx",
    })
  })

  it("should resolve file path starting with ./", () => {
    const result = resolveItemAddress("./button.tsx", registries)
    expect(result).toEqual({
      scheme: "file",
      item: "./button.tsx",
      filePath: "./button.tsx",
    })
  })

  it("should resolve @shadcn-rn/ prefixed items", () => {
    const result = resolveItemAddress("@shadcn-rn/button", registries)
    expect(result).toEqual({
      scheme: "shadcn-rn",
      registry: "@shadcn-rn",
      item: "button",
    })
  })

  it("should resolve custom registry items", () => {
    const result = resolveItemAddress("@custom/button", registries)
    expect(result).toEqual({
      scheme: "namespace",
      registry: "@custom",
      item: "button",
    })
  })

  it("should default to shadcn-rn for plain names", () => {
    const result = resolveItemAddress("button", registries)
    expect(result).toEqual({
      scheme: "shadcn-rn",
      registry: "@shadcn-rn",
      item: "button",
    })
  })
})
