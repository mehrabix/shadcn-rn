export function ensureRegistry(
  config: Record<string, unknown>,
  registryName: string
): Record<string, unknown> {
  if (!config.registries) {
    config.registries = {}
  }

  const registries = config.registries as Record<string, unknown>
  if (!registries[registryName]) {
    registries[registryName] = `https://example.com/${registryName}/{name}.json`
  }

  return config
}

export function getRegistryUrl(
  config: Record<string, unknown>,
  registryName: string
): string | null {
  const registries = config.registries as Record<string, string> | undefined
  if (!registries || !registries[registryName]) {
    return null
  }
  return registries[registryName]
}
