import type { RegistryConfig } from "./schema"

export interface EnvVarExtraction {
  vars: Set<string>
  sources: string[]
}

export function extractEnvVarsFromRegistryConfig(
  config: RegistryConfig
): EnvVarExtraction {
  const vars = new Set<string>()
  const sources: string[] = []

  for (const [name, registryConfig] of Object.entries(config.registries)) {
    if (typeof registryConfig === "string") {
      const matches = registryConfig.match(/\$\{(\w+)\}/g)
      if (matches) {
        for (const match of matches) {
          const varName = match.slice(2, -1)
          vars.add(varName)
          sources.push(`${name}: ${registryConfig}`)
        }
      }
    } else if (registryConfig.url) {
      const urlMatches = registryConfig.url.match(/\$\{(\w+)\}/g)
      if (urlMatches) {
        for (const match of urlMatches) {
          const varName = match.slice(2, -1)
          vars.add(varName)
          sources.push(`${name}: ${registryConfig.url}`)
        }
      }

      if (registryConfig.headers) {
        for (const [key, value] of Object.entries(registryConfig.headers)) {
          const headerMatches = value.match(/\$\{(\w+)\}/g)
          if (headerMatches) {
            for (const match of headerMatches) {
              const varName = match.slice(2, -1)
              vars.add(varName)
              sources.push(`${name}: header ${key}`)
            }
          }
        }
      }
    }
  }

  return { vars, sources }
}

export function validateRegistryConfig(
  config: RegistryConfig
): { valid: boolean; missing: string[] } {
  const { vars } = extractEnvVarsFromRegistryConfig(config)
  const missing: string[] = []

  for (const varName of vars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}
