import { describe, it, expect, vi, afterEach } from "vitest"
import { ConfigMissingError } from "../../src/registry/errors"

const { mockLoadConfig, mockResolveImport } = vi.hoisted(() => ({
  mockLoadConfig: vi.fn().mockResolvedValue({
    resultType: "success",
    absoluteBaseUrl: "/test",
    paths: {},
  }),
  mockResolveImport: vi.fn().mockImplementation(
    async (alias: string) => {
      const map: Record<string, string> = {
        "@/lib/utils": "/test/src/lib/utils",
        "@/components": "/test/src/components",
        "@/components/ui": "/test/src/components/ui",
        "@/lib": "/test/src/lib",
        "@/hooks": "/test/src/hooks",
      }
      return map[alias] ? { path: map[alias], source: "tsconfig_paths", matchedAlias: alias } : null
    }
  ),
}))

vi.mock("fs/promises", () => ({
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("cosmiconfig", () => ({
  cosmiconfig: vi.fn().mockReturnValue({
    search: vi.fn().mockResolvedValue(null),
  }),
}))

vi.mock("tsconfig-paths", () => ({
  loadConfig: mockLoadConfig,
}))

vi.mock("../../src/utils/resolve-import", () => ({
  resolveImportWithMetadata: mockResolveImport,
}))

vi.mock("../../src/utils/highlighter", () => ({
  highlighter: {
    info: (s: string) => s,
    success: (s: string) => s,
    warning: (s: string) => s,
    error: (s: string) => s,
    dim: (s: string) => s,
    bold: (s: string) => s,
  },
}))

vi.mock("fast-glob", () => ({
  default: { glob: vi.fn().mockResolvedValue([]) },
}))

describe("get-config", () => {
  afterEach(() => {
    vi.clearAllMocks()
    mockLoadConfig.mockResolvedValue({
      resultType: "success",
      absoluteBaseUrl: "/test",
      paths: {},
    })
  })

  describe("getConfig", () => {
    it("should throw ConfigMissingError for missing config", async () => {
      const { getConfig } = await import("../../src/utils/get-config")
      await expect(getConfig("/test")).rejects.toThrow(ConfigMissingError)
    })
  })

  describe("resolveConfigPaths", () => {
    it("should resolve default paths", async () => {
      const { resolveConfigPaths } = await import("../../src/utils/get-config")
      const config = {
        style: "default",
        tsx: true,
        nativewind: { baseColor: "neutral", cssVariables: true },
      }
      const resolved = await resolveConfigPaths("/test", config)
      expect(resolved.resolvedPaths.cwd).toBe("/test")
      expect(resolved.resolvedPaths.utils).toBe("/test/src/lib/utils")
      expect(resolved.resolvedPaths.components).toBe("/test/src/components")
      expect(resolved.resolvedPaths.nativewindCss).toContain("global.css")
    })

    it("should throw for unresolvable aliases", async () => {
      const { resolveConfigPaths } = await import("../../src/utils/get-config")
      const config = {
        style: "default",
        tsx: true,
        aliases: { components: "@/ui", utils: "@/helpers" },
      }
      await expect(resolveConfigPaths("/test", config)).rejects.toThrow(
        "Could not resolve the following aliases"
      )
    })

    it("should throw for failed tsconfig load", async () => {
      mockLoadConfig.mockResolvedValueOnce({
        resultType: "failed",
        message: "No tsconfig found",
      })
      const { resolveConfigPaths } = await import("../../src/utils/get-config")
      const config = {
        style: "default",
        tsx: true,
        nativewind: { baseColor: "neutral", cssVariables: true },
      }
      await expect(resolveConfigPaths("/test", config)).rejects.toThrow(
        "Failed to load tsconfig"
      )
    })
  })
})
