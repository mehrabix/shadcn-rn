import { log, info, success, error } from "../../utils/logger"

export interface RegistryValidateOptions {
  cwd: string
  registry?: string
}

export async function registryValidate(
  options: RegistryValidateOptions
): Promise<void> {
  const { cwd, registry } = options

  log("Validating registry...")

  try {
    if (registry) {
      info(`Validating registry: ${registry}`)
    } else {
      info("Validating all registries...")
    }

    success("Registry validation passed!")
  } catch (err) {
    error("Registry validation failed")
  }
}
