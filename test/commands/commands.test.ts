import { describe, it, expect, vi, beforeEach } from "vitest"
import { infoCommand } from "../../src/commands/info"
import { migrate } from "../../src/commands/migrate"
import { diff } from "../../src/commands/diff"
import { apply } from "../../src/commands/apply"
import { eject } from "../../src/commands/eject"

vi.mock("open", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
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
    },
  }),
}))

vi.mock("fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue("test content"),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

describe("commands", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("migrate", () => {
    it("should run migrations without type", async () => {
      await expect(migrate({ cwd: "/test" })).resolves.toBeUndefined()
    })

    it("should run specific migration", async () => {
      await expect(migrate({ cwd: "/test", type: "icons" })).resolves.toBeUndefined()
    })
  })

  describe("info", () => {
    it("should display project info", async () => {
      await expect(infoCommand({ cwd: "/test" })).resolves.toBeUndefined()
    })
  })

  describe("diff", () => {
    it("should check all components", async () => {
      await expect(diff({ cwd: "/test" })).resolves.toBeUndefined()
    })

    it("should check specific component", async () => {
      await expect(diff({ cwd: "/test", component: "button" })).resolves.toBeUndefined()
    })
  })
})
