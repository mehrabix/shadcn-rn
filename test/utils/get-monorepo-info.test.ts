import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getMonorepoInfo } from "../../src/utils/get-monorepo-info"
import * as fs from "fs/promises"
import * as os from "os"
import * as path from "path"

vi.mock("fs/promises")

describe("get-monorepo-info", () => {
  const mockFs = vi.mocked(fs)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should detect workspaces as monorepo", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      workspaces: ["packages/*", "apps/*"]
    }))
    const result = await getMonorepoInfo("/test")
    expect(result.isMonorepo).toBe(true)
    expect(result.packages).toEqual(["packages/*", "apps/*"])
  })

  it("should detect object workspaces", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      workspaces: { packages: ["packages/*"] }
    }))
    const result = await getMonorepoInfo("/test")
    expect(result.isMonorepo).toBe(true)
    expect(result.packages).toEqual(["packages/*"])
  })

  it("should return false for non-monorepo", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({}))
    const result = await getMonorepoInfo("/test")
    expect(result.isMonorepo).toBe(false)
    expect(result.packages).toEqual([])
  })

  it("should handle missing package.json", async () => {
    mockFs.readFile.mockRejectedValue(new Error("ENOENT"))
    const result = await getMonorepoInfo("/test")
    expect(result.isMonorepo).toBe(false)
    expect(result.packages).toEqual([])
  })

  it("should detect pnpm type", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      workspaces: ["packages/*"]
    }))
    mockFs.access.mockImplementation(async (p) => {
      if (String(p).includes("pnpm-workspace.yaml")) return undefined
      throw new Error("ENOENT")
    })
    const result = await getMonorepoInfo("/test")
    expect(result.type).toBe("pnpm")
  })
})
