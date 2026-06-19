import { describe, it, expect } from "vitest"
import { getInstallCommand, getDevInstallCommand } from "../../src/utils/get-package-manager"

describe("get-package-manager", () => {
  describe("getInstallCommand", () => {
    it("should return npm install for npm", () => {
      expect(getInstallCommand("npm")).toBe("npm install")
    })

    it("should return yarn add for yarn", () => {
      expect(getInstallCommand("yarn")).toBe("yarn add")
    })

    it("should return pnpm add for pnpm", () => {
      expect(getInstallCommand("pnpm")).toBe("pnpm add")
    })

    it("should return bun add for bun", () => {
      expect(getInstallCommand("bun")).toBe("bun add")
    })
  })

  describe("getDevInstallCommand", () => {
    it("should return npm install -D for npm", () => {
      expect(getDevInstallCommand("npm")).toBe("npm install -D")
    })

    it("should return yarn add -D for yarn", () => {
      expect(getDevInstallCommand("yarn")).toBe("yarn add -D")
    })

    it("should return pnpm add -D for pnpm", () => {
      expect(getDevInstallCommand("pnpm")).toBe("pnpm add -D")
    })

    it("should return bun add -D for bun", () => {
      expect(getDevInstallCommand("bun")).toBe("bun add -D")
    })
  })
})
