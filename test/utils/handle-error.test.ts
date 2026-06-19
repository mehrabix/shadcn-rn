import { describe, it, expect, vi, afterEach } from "vitest"
import { handleError } from "../../src/utils/handle-error"

vi.mock("process", async () => {
  const actual = await vi.importActual("process")
  return { ...actual, exit: vi.fn() }
})

describe("handleError", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should handle Error instances", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
    handleError(new Error("test error"))
    expect(consoleError).toHaveBeenCalledWith("test error")
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it("should handle errors with cause", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
    const error = new Error("test error")
    error.cause = new Error("root cause")
    handleError(error)
    expect(consoleError).toHaveBeenCalledWith("test error")
    expect(consoleError).toHaveBeenCalledWith("Caused by:", error.cause)
  })

  it("should handle non-Error values", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
    handleError("string error")
    expect(consoleError).toHaveBeenCalledWith("An unknown error occurred:", "string error")
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it("should handle null", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
    handleError(null)
    expect(consoleError).toHaveBeenCalledWith("An unknown error occurred:", null)
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
