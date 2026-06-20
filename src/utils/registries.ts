import path from "path"
import { getRegistriesIndex } from "../registry/api"
import { BUILTIN_REGISTRIES } from "../registry/constants"
import { resolveRegistryNamespaces } from "../registry/namespaces"
import { rawConfigSchema } from "../registry/schema"
import type { Config } from "../utils/get-config"
import { spinner } from "../utils/spinner"
import fs from "fs-extra"

export async function ensureRegistriesInConfig(
  components: string[],
  config: Config,
  options: {
    silent?: boolean
    writeFile?: boolean
  } = {}
) {
  options = {
    silent: false,
    writeFile: true,
    ...options,
  }

  const namespaceResolutions = await resolveRegistryNamespaces(components, config)
  const registryNames = namespaceResolutions.map(r => r.registry)

  const missingRegistries = registryNames.filter(
    (registry) =>
      !config.registries?.[registry] &&
      !Object.keys(BUILTIN_REGISTRIES).includes(registry)
  )

  if (missingRegistries.length === 0) {
    return {
      config,
      newRegistries: [],
    }
  }

  const registryIndex = await getRegistriesIndex({
    useCache: process.env.NODE_ENV !== "development",
  })

  if (!registryIndex) {
    return {
      config,
      newRegistries: [],
    }
  }

  const foundRegistries: Record<string, string> = {}
  for (const registry of missingRegistries) {
    if (registryIndex[registry]) {
      foundRegistries[registry] = registryIndex[registry]
    }
  }

  if (Object.keys(foundRegistries).length === 0) {
    return {
      config,
      newRegistries: [],
    }
  }

  const existingRegistries = Object.fromEntries(
    Object.entries(config.registries || {}).filter(
      ([key]) => !Object.keys(BUILTIN_REGISTRIES).includes(key)
    )
  )

  const newConfigWithRegistries = {
    ...config,
    registries: {
      ...existingRegistries,
      ...foundRegistries,
    },
  }

  if (options.writeFile) {
    const { resolvedPaths, ...configWithoutResolvedPaths } =
      newConfigWithRegistries
    const configSpinner = spinner("Updating components.json.", {
      silent: options.silent,
    }).start()
    const updatedConfig = rawConfigSchema.parse(configWithoutResolvedPaths)
    await fs.writeFile(
      path.resolve(config.resolvedPaths.cwd, "components.json"),
      JSON.stringify(updatedConfig, null, 2) + "\n",
      "utf-8"
    )
    configSpinner.succeed()
  }

  return {
    config: newConfigWithRegistries,
    newRegistries: Object.keys(foundRegistries),
  }
}
