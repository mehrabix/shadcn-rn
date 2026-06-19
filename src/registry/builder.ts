export interface RegistryBuildContext {
  url: string
  headers: Record<string, string>
}

export function buildUrlAndHeadersForRegistryItem(
  name: string,
  registries: Record<string, string | { url: string; params?: Record<string, string>; headers?: Record<string, string> }>
): RegistryBuildContext | null {
  const slashIndex = name.indexOf("/")
  if (slashIndex === -1) {
    return null
  }

  const namespace = name.substring(0, slashIndex)
  const itemName = name.substring(slashIndex + 1)

  const registryConfig = registries[namespace]
  if (!registryConfig) {
    return null
  }

  if (typeof registryConfig === "string") {
    const url = registryConfig.replace("{name}", itemName)
    return { url, headers: {} }
  }

  const url = registryConfig.url.replace("{name}", itemName)
  const headers = registryConfig.headers || {}
  const params = registryConfig.params || {}

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")

  const fullUrl = queryString ? `${url}?${queryString}` : url

  return { url: fullUrl, headers }
}

export function expandEnvVars(str: string): string {
  return str.replace(/\$\{(\w+)\}/g, (_, envVar) => {
    return process.env[envVar] || ""
  })
}

export function buildUrlFromRegistryConfig(
  config: string | { url: string; params?: Record<string, string> },
  name: string,
  style?: string
): string {
  const url = typeof config === "string" ? config : config.url
  const params = typeof config === "object" ? config.params : undefined

  let resolvedUrl = url
    .replace("{name}", name)
    .replace("{style}", style || "default")

  resolvedUrl = expandEnvVars(resolvedUrl)

  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(expandEnvVars(value))}`)
      .join("&")
    resolvedUrl = `${resolvedUrl}?${queryString}`
  }

  return resolvedUrl
}

export function buildHeadersFromRegistryConfig(
  config: { headers?: Record<string, string> } | undefined
): Record<string, string> {
  if (!config?.headers) {
    return {}
  }

  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(config.headers)) {
    const expanded = expandEnvVars(value)
    if (expanded) {
      headers[key] = expanded
    }
  }
  return headers
}
