import { describe, it, expect, vi, beforeEach } from "vitest"
import { resolveSource } from "../../src/registry/source"
import * as fetcher from "../../src/registry/fetcher"
import * as github from "../../src/registry/github"

vi.mock("../../src/registry/fetcher")
vi.mock("../../src/registry/github")

const baseConfig = {
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

describe("source", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("resolveSource", () => {
    it("should resolve URL source", async () => {
      vi.mocked(fetcher.fetchRegistry).mockResolvedValue([{
        name: "button",
        type: "registry:ui",
        files: [],
      }])
      const result = await resolveSource("https://example.com/button.json", baseConfig)
      expect(result.type).toBe("url")
      expect(result.items).toHaveLength(1)
    })

    it("should resolve GitHub URL source", async () => {
      vi.mocked(github.fetchRegistryFromGitHub).mockResolvedValue([{
        name: "button",
        type: "registry:ui",
        files: [],
      }])
      const result = await resolveSource("github.com/user/repo", baseConfig)
      expect(result.type).toBe("github")
      expect(result.items).toHaveLength(1)
    })

    it("should resolve registry source", async () => {
      vi.mocked(fetcher.fetchRegistry).mockResolvedValue([{
        name: "button",
        type: "registry:ui",
        files: [],
      }])
      const result = await resolveSource("@shadcn-rn/button", baseConfig)
      expect(result.type).toBe("registry")
      expect(result.items).toHaveLength(1)
    })

    it("should return unknown for unrecognized input", async () => {
      const result = await resolveSource("unknown-input", baseConfig)
      expect(result.type).toBe("unknown")
      expect(result.items).toHaveLength(0)
    })
  })
})
