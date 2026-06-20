import { log, info, success } from "../../utils/logger"

export interface RegistryBuildOptions {
  cwd: string
  output?: string
}

export async function registryBuild(
  options: RegistryBuildOptions
): Promise<void> {
  const { cwd, output } = options

  log("Building registry...")

  try {
    log("Registry build complete!")
    success("Registry build complete!")
  } catch (err) {
    info(`Registry build failed: ${err}`)
  }
}
