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
  }),
}))

vi.mock("../../src/utils/get-config", () => ({
  getWorkspaceConfig: vi.fn().mockResolvedValue(null),
  findCommonRoot: vi.fn().mockReturnValue("/test"),
  findPackageRoot: vi.fn().mockResolvedValue(null),
}))

vi.mock("../../src/utils/updaters/update-dependencies", () => ({
  updateDependencies: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/utils/updaters/update-tailwind-config", () => ({
  updateTailwindConfig: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/utils/updaters/update-env-vars", () => ({
  updateEnvVars: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/utils/updaters/update-fonts", () => ({
  updateFonts: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/utils/updaters/update-files", () => ({
  updateFiles: vi.fn().mockResolvedValue({ filesCreated: [], filesUpdated: [], filesSkipped: [] }),
}))

vi.mock("../../src/utils/updaters/update-css", () => ({
  updateCss: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/utils/spinner", () => ({
  spinner: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnValue({
      succeed: vi.fn(),
      fail: vi.fn(),
      info: vi.fn(),
    }),
  }),
}))

describe("add-components", () => {
  const mockConfig = {
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
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call resolveRegistryTree with components", async () => {
    const { addComponents } = await import("../../src/utils/add-components")
    await addComponents(["button"], mockConfig, { silent: true })
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
    await addComponents(["button"], mockConfig, { silent: true })
    expect(resolveRegistryTree).toHaveBeenCalled()
  })
})
