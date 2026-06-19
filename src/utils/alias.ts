export interface AliasConfig {
  components: string
  utils: string
  ui?: string
  lib?: string
  hooks?: string
}

export function resolveAliasDefaults(
  framework: string,
  srcDir: boolean = true
): AliasConfig {
  const prefix = srcDir ? "@/src" : "@"

  return {
    components: `${prefix}/components`,
    utils: `${prefix}/lib/utils`,
    ui: `${prefix}/components/ui`,
    lib: `${prefix}/lib`,
    hooks: `${prefix}/hooks`,
  }
}

export function createAliasConfig(
  overrides: Partial<AliasConfig> = {}
): AliasConfig {
  const defaults = resolveAliasDefaults("expo")
  return { ...defaults, ...overrides }
}
