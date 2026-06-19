import { describe, it, expect } from "vitest"
import {
  registryConfigSchema,
  registryConfigItemSchema,
  rawConfigSchema,
  registryItemSchema,
  registrySchema,
} from "../../src/registry/schema"

describe("registryConfigItemSchema", () => {
  it("should validate string URL with {name} placeholder", () => {
    const result = registryConfigItemSchema.safeParse("https://example.com/{name}.json")
    expect(result.success).toBe(true)
  })

  it("should reject string URL without {name} placeholder", () => {
    const result = registryConfigItemSchema.safeParse("https://example.com/test.json")
    expect(result.success).toBe(false)
  })

  it("should validate object with url and headers", () => {
    const result = registryConfigItemSchema.safeParse({
      url: "https://example.com/{name}.json",
      headers: { Authorization: "Bearer token" },
    })
    expect(result.success).toBe(true)
  })

  it("should validate object with url and params", () => {
    const result = registryConfigItemSchema.safeParse({
      url: "https://example.com/{name}.json",
      params: { version: "1.0" },
    })
    expect(result.success).toBe(true)
  })
})

describe("registryConfigSchema", () => {
  it("should validate registry config with @ prefix", () => {
    const result = registryConfigSchema.safeParse({
      "@custom": "https://example.com/{name}.json",
    })
    expect(result.success).toBe(true)
  })

  it("should reject registry without @ prefix", () => {
    const result = registryConfigSchema.safeParse({
      custom: "https://example.com/{name}.json",
    })
    expect(result.success).toBe(false)
  })

  it("should validate multiple registries", () => {
    const result = registryConfigSchema.safeParse({
      "@shadcn-rn": "https://example.com/{name}.json",
      "@custom": {
        url: "https://custom.com/{name}.json",
        headers: { "X-Api-Key": "key" },
      },
    })
    expect(result.success).toBe(true)
  })
})

describe("rawConfigSchema", () => {
  it("should validate minimal config", () => {
    const result = rawConfigSchema.safeParse({
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    })
    expect(result.success).toBe(true)
  })

  it("should apply defaults", () => {
    const result = rawConfigSchema.safeParse({
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.style).toBe("default")
      expect(result.data.tsx).toBe(true)
      expect(result.data.nativewind.baseColor).toBe("neutral")
      expect(result.data.nativewind.cssVariables).toBe(true)
    }
  })

  it("should validate full config", () => {
    const result = rawConfigSchema.safeParse({
      style: "new-york",
      tsx: true,
      nativewind: {
        baseColor: "zinc",
        cssVariables: true,
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks",
      },
      registries: {
        "@custom": "https://example.com/{name}.json",
      },
    })
    expect(result.success).toBe(true)
  })
})

describe("registryItemSchema", () => {
  it("should validate UI component item", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:ui",
      description: "A button component",
      files: [
        {
          path: "components/ui/button.tsx",
          type: "registry:ui",
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("should validate hook item", () => {
    const result = registryItemSchema.safeParse({
      name: "use-theme",
      type: "registry:hook",
      description: "A theme hook",
      files: [
        {
          path: "hooks/use-theme.ts",
          type: "registry:hook",
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("should validate base config item", () => {
    const result = registryItemSchema.safeParse({
      name: "base",
      type: "registry:base",
      config: {
        style: "default",
      },
    })
    expect(result.success).toBe(true)
  })

  it("should validate item with dependencies", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:ui",
      dependencies: ["react-native"],
      registryDependencies: ["utils"],
      files: [
        {
          path: "components/ui/button.tsx",
          type: "registry:ui",
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("should validate item with CSS vars", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:ui",
      cssVars: {
        light: {
          "--primary": "0 0% 9%",
        },
        dark: {
          "--primary": "0 0% 98%",
        },
      },
    })
    expect(result.success).toBe(true)
  })
})

describe("registrySchema", () => {
  it("should validate full registry", () => {
    const result = registrySchema.safeParse({
      name: "shadcn-rn",
      homepage: "https://github.com/mehrabix/shadcn-rn",
      items: [
        {
          name: "button",
          type: "registry:ui",
          files: [
            {
              path: "components/ui/button.tsx",
              type: "registry:ui",
            },
          ],
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("should reject registry without items or include", () => {
    const result = registrySchema.safeParse({
      name: "test",
      homepage: "https://example.com",
    })
    expect(result.success).toBe(false)
  })
})
