import { describe, it, expect, vi, afterEach } from "vitest"
import { getConfig, resolveConfigPaths } from "../../src/utils/get-config"
import * as fs from "fs/promises"
import { ConfigMissingError, ConfigParseError } from "../../src/registry/errors"

vi.mock("fs/promises")

describe("get-config", () => {
  const mockFs = vi.mocked(fs)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getConfig", () => {
    it("should read and parse config", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        style: "default",
        tsx: true,
        aliases: { components: "@/components", utils: "@/lib/utils" }
      }))
      const config = await getConfig("/test")
      expect(config.style).toBe("default")
      expect(config.tsx).toBe(true)
      expect(config.resolvedPaths.components).toBe("@/components")
      expect(config.resolvedPaths.utils).toBe("@/lib/utils")
    })

    it("should throw ConfigMissingError for missing config", async () => {
      mockFs.readFile.mockRejectedValue(new Error("ENOENT"))
      await expect(getConfig("/test")).rejects.toThrow(ConfigMissingError)
    })

    it("should throw ConfigParseError for invalid config", async () => {
      mockFs.readFile.mockResolvedValue("not json")
      await expect(getConfig("/test")).rejects.toThrow()
    })
  })

  describe("resolveConfigPaths", () => {
    it("should resolve default paths", () => {
      const config = {
        style: "default",
        tsx: true,
        nativewind: { baseColor: "neutral", cssVariables: true }
      }
      const resolved = resolveConfigPaths(config, "/test")
      expect(resolved.resolvedPaths.cwd).toBe("/test")
      expect(resolved.resolvedPaths.utils).toBe("@/lib/utils")
      expect(resolved.resolvedPaths.components).toBe("@/components")
      expect(resolved.resolvedPaths.nativewindConfig).toBe("nativewind.config.js")
    })

    it("should use custom aliases", () => {
      const config = {
        style: "default",
        tsx: true,
        aliases: { components: "@/ui", utils: "@/helpers" }
      }
      const resolved = resolveConfigPaths(config, "/test")
      expect(resolved.resolvedPaths.components).toBe("@/ui")
      expect(resolved.resolvedPaths.utils).toBe("@/helpers")
    })
  })
})
