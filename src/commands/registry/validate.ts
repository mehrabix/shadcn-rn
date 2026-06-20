import * as fs from "fs/promises"
import * as path from "path"
import { log, info, success, error } from "../../utils/logger"
import { validateRegistry } from "../../registry/validate"

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
    const registryPath = registry
      ? path.resolve(cwd, registry)
      : path.resolve(cwd, "registry.json")

    const content = await fs.readFile(registryPath, "utf-8")
    const data = JSON.parse(content)

    const result = validateRegistry(data)

    if (result.valid) {
      success("Registry validation passed!")
    } else {
      error("Registry validation failed:")
      for (const err of result.errors) {
        info(`  - ${err}`)
      }
    }

    if (result.warnings.length > 0) {
      info("Warnings:")
      for (const warn of result.warnings) {
        info(`  - ${warn}`)
      }
    }
  } catch (err) {
    error(`Registry validation failed: ${err}`)
  }
}
