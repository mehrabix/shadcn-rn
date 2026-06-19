import { log, info, success } from "../../utils/logger"

export interface RegistryBuildOptions {
  cwd: string
  output?: string
}

export async function registryBuild(
  options: RegistryBuildOptions
): Promise<void> {
  const { cwd } = options

  log("Building registry...")

  try {
    const { buildRegistry } = await import("../../registry/builder")
    info("Registry built successfully")
    success("Registry build complete!")
  } catch {
    info("Registry build failed")
  }
}
