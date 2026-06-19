import { BUILTIN_REGISTRIES } from "./constants"

export interface RegistryConfig {
  registries: Record<string, string | { url: string; params?: Record<string, string>; headers?: Record<string, string> }>
}

export function configWithDefaults(
  config: Partial<RegistryConfig>
): RegistryConfig {
  return {
    registries: {
      ...BUILTIN_REGISTRIES,
      ...config.registries,
    },
  }
}
