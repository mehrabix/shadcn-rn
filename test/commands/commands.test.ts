import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("open", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs")
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
  }
})

vi.mock("fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue("test content"),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([]),
  stat: vi.fn().mockResolvedValue({ isDirectory: () => false, isFile: () => true }),
  access: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("prompts", () => ({
  default: vi.fn().mockResolvedValue({ confirm: true }),
}))

vi.mock("../../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
    style: "default",
    tsx: true,
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      hooks: "@/hooks",
      lib: "@/lib",
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
  }),
}))

vi.mock("../../src/migrations", () => ({
  runMigration: vi.fn().mockResolvedValue(true),
  runAllMigrations: vi.fn().mockResolvedValue(undefined),
  migrations: [],
}))

vi.mock("../../src/registry/api", () => ({
  getRegistryItems: vi.fn().mockResolvedValue([]),
}))

vi.mock("../../src/utils/add-components", () => ({
  addComponents: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("path", async () => {
  const actual = await vi.importActual<typeof import("path")>("path")
  return {
    ...actual,
    resolve: (...args: string[]) => args[args.length - 1],
  }
})

describe("commands", () => {
  const mockExit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    mockExit.mockRestore()
  })

  describe("migrate", () => {
    it("should run specific migration", async () => {
      const { migrate } = await import("../../src/commands/migrate")
      await migrate.parseAsync(["node", "migrate", "--type", "icons", "-y", "-c", "/test"])
      expect(mockExit).not.toHaveBeenCalled()
    })
  })

  describe("info", () => {
    it("should display project info", async () => {
      const { infoCommand } = await import("../../src/commands/info")
      await infoCommand.parseAsync(["node", "info", "-c", "/test"])
      expect(mockExit).not.toHaveBeenCalled()
    })
  })

  describe("diff", () => {
    it("should check all components", async () => {
      const { diff } = await import("../../src/commands/diff")
      await diff.parseAsync(["node", "diff", "-c", "/test"])
    })
  })
})
