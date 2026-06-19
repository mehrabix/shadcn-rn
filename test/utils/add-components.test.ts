import { describe, it, expect, vi, beforeEach } from "vitest"
import { resolveRegistryTree } from "../../src/registry/resolver"

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockRejectedValue(new Error("ENOENT")),
    readFile: vi.fn(),
  },
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error("ENOENT")),
  readFile: vi.fn(),
}))

vi.mock("../../src/registry/resolver", () => ({
  resolveRegistryTree: vi.fn().mockResolvedValue({
    dependencies: [],
    devDependencies: [],
    files: [{ path: "button.tsx", type: "registry:ui", content: "export const Button = () => {}" }],
    tailwind: {},
    cssVars: {},
    css: {},
    envVars: {},
  })
}))

describe("add-components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call resolveRegistryTree with components", async () => {
    const { addComponents } = await import("../../src/utils/add-components")
    await addComponents({
      config: {
        style: "default",
        tsx: true,
        resolvedPaths: {
          cwd: "/test",
          nativewindConfig: "nativewind.config.js",
          nativewindCss: "global.css",
          utils: "@/lib/utils",
          components: "@/components",
          lib: "@/lib",
          hooks: "@/hooks",
          ui: "@/components/ui",
        }
      },
      components: ["button"],
    })
    expect(resolveRegistryTree).toHaveBeenCalledWith(["button"], expect.anything())
  })

  it("should handle empty files from resolver", async () => {
    vi.mocked(resolveRegistryTree).mockResolvedValue({
      dependencies: [],
      devDependencies: [],
      files: [],
      tailwind: {},
      cssVars: {},
      css: {},
      envVars: {},
    })
    const { addComponents } = await import("../../src/utils/add-components")
    await addComponents({
      config: {
        style: "default",
        tsx: true,
        resolvedPaths: {
          cwd: "/test",
          nativewindConfig: "nativewind.config.js",
          nativewindCss: "global.css",
          utils: "@/lib/utils",
          components: "@/components",
          lib: "@/lib",
          hooks: "@/hooks",
          ui: "@/components/ui",
        }
      },
      components: ["button"],
    })
    expect(resolveRegistryTree).toHaveBeenCalled()
  })
})
