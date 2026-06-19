import { describe, it, expect, vi, afterEach } from "vitest"
import { getProjectInfo } from "../../src/utils/get-project-info"
import * as fs from "fs/promises"
import * as path from "path"

vi.mock("fs/promises")

describe("get-project-info", () => {
  const mockFs = vi.mocked(fs)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should detect expo framework", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      dependencies: { expo: "~50.0.0" }
    }))
    mockFs.access.mockRejectedValue(new Error("ENOENT"))
    const info = await getProjectInfo("/test")
    expect(info.framework).toBe("expo")
  })

  it("should detect bare react-native", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      dependencies: { "react-native": "0.73.0" }
    }))
    mockFs.access.mockRejectedValue(new Error("ENOENT"))
    const info = await getProjectInfo("/test")
    expect(info.framework).toBe("bare-react-native")
  })

  it("should detect nativewind", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      dependencies: { nativewind: "^2.0.0" }
    }))
    mockFs.access.mockRejectedValue(new Error("ENOENT"))
    const info = await getProjectInfo("/test")
    expect(info.hasNativeWind).toBe(true)
  })

  it("should detect typescript", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      devDependencies: { typescript: "^5.0.0" }
    }))
    mockFs.access.mockRejectedValue(new Error("ENOENT"))
    const info = await getProjectInfo("/test")
    expect(info.hasTypeScript).toBe(true)
  })

  it("should return unknown for missing package.json", async () => {
    mockFs.readFile.mockRejectedValue(new Error("ENOENT"))
    const info = await getProjectInfo("/test")
    expect(info.framework).toBe("unknown")
    expect(info.hasNativeWind).toBe(false)
  })

  it("should detect npm from package-lock.json", async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({}))
    mockFs.access.mockImplementation(async (p) => {
      if (String(p).includes("package-lock.json")) return undefined
      throw new Error("ENOENT")
    })
    const info = await getProjectInfo("/test")
    expect(info.packageManager).toBe("npm")
  })
})
