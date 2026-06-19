import { describe, it, expect, vi } from "vitest"
import { resolveRegistryNamespaces } from "../../src/registry/namespaces"

vi.mock("../../src/registry/fetcher", () => ({
  fetchRegistry: vi.fn().mockResolvedValue([{
    name: "button",
    type: "registry:ui",
    files: [],
  }]),
}))

describe("namespaces", () => {
  describe("resolveRegistryNamespaces", () => {
    it("should resolve namespace items", async () => {
      const config = {
        style: "default",
        tsx: true,
        registries: {
          "@shadcn-rn": "https://shadcn-rn.dev/r/{name}.json",
        },
        resolvedPaths: {
          cwd: "/test",
          nativewindConfig: "nativewind.config.js",
          nativewindCss: "global.css",
          utils: "@/lib/utils",
          components: "@/components",
          lib: "@/lib",
          hooks: "@/hooks",
          ui: "@/components/ui",
        },
      }
      const resolutions = await resolveRegistryNamespaces(
        ["@shadcn-rn/button"],
        config
      )
      expect(resolutions).toHaveLength(1)
      expect(resolutions[0].registry).toBe("@shadcn-rn")
      expect(resolutions[0].items).toHaveLength(1)
    })

    it("should handle empty names", async () => {
      const config = {
        style: "default",
        tsx: true,
        registries: {},
        resolvedPaths: {
          cwd: "/test",
          nativewindConfig: "nativewind.config.js",
          nativewindCss: "global.css",
          utils: "@/lib/utils",
          components: "@/components",
          lib: "@/lib",
          hooks: "@/hooks",
          ui: "@/components/ui",
        },
      }
      const resolutions = await resolveRegistryNamespaces([], config)
      expect(resolutions).toHaveLength(0)
    })
  })
})
