import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { backupFile, restoreFile, clearBackups } from "../../src/utils/file-helper"
import * as fs from "fs/promises"
import * as os from "os"
import * as path from "path"

vi.mock("fs/promises")

describe("file-helper", () => {
  const mockFs = vi.mocked(fs)

  beforeEach(() => {
    clearBackups()
    vi.clearAllMocks()
  })

  describe("backupFile", () => {
    it("should backup file content", async () => {
      mockFs.readFile.mockResolvedValue("test content")
      const backup = await backupFile("test.ts")
      expect(backup.content).toBe("test content")
      expect(backup.path).toBe("test.ts")
      expect(backup.timestamp).toBeTypeOf("number")
    })

    it("should store backup for restore", async () => {
      mockFs.readFile.mockResolvedValue("original")
      await backupFile("test.ts")
      mockFs.writeFile.mockResolvedValue(undefined)
      const restored = await restoreFile("test.ts")
      expect(restored).toBe(true)
      expect(mockFs.writeFile).toHaveBeenCalledWith("test.ts", "original")
    })
  })

  describe("restoreFile", () => {
    it("should return false if no backup exists", async () => {
      const restored = await restoreFile("nonexistent.ts")
      expect(restored).toBe(false)
    })

    it("should restore backed up file", async () => {
      mockFs.readFile.mockResolvedValue("backed up content")
      await backupFile("test.ts")
      mockFs.writeFile.mockResolvedValue(undefined)
      const restored = await restoreFile("test.ts")
      expect(restored).toBe(true)
      expect(mockFs.writeFile).toHaveBeenCalledWith("test.ts", "backed up content")
    })
  })

  describe("clearBackups", () => {
    it("should clear all backups", async () => {
      mockFs.readFile.mockResolvedValue("content")
      await backupFile("test.ts")
      clearBackups()
      const restored = await restoreFile("test.ts")
      expect(restored).toBe(false)
    })
  })
})
