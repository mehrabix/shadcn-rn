import type { RegistryItem, Registry, Config } from "./schema"
import { fetchRegistry, fetchRegistryLocal } from "./fetcher"
import { resolveRegistryTree } from "./resolver"
import { buildUrlAndHeadersForRegistryItem } from "./builder"
import { configWithDefaults } from "./config"
import { REGISTRY_URL, BUILTIN_REGISTRIES } from "./constants"

export async function getRegistry(config: Config): Promise<Registry> {
  const resolvedConfig = configWithDefaults(config)
  const indexUrl = `${REGISTRY_URL}/index.json`

  const items = await fetchRegistry([indexUrl])

  return {
    name: "shadcn-rn",
    homepage: "https://github.com/mehrabix/shadcn-rn",
    items,
  }
}

export async function getRegistryItems(
  names: string[],
  config: Config
): Promise<RegistryItem[]> {
  const resolvedConfig = configWithDefaults(config)

  const urls: string[] = []
  const headers: Record<string, string>[] = []

  for (const name of names) {
    const urlInfo = buildUrlAndHeadersForRegistryItem(name, resolvedConfig.registries)
    if (urlInfo) {
      urls.push(urlInfo.url)
      headers.push(urlInfo.headers)
    }
  }

  return fetchRegistry(urls, {
    headers: headers.reduce((acc, h) => ({ ...acc, ...h }), {}),
  })
}

export async function resolveRegistryItems(
  names: string[],
  config: Config
) {
  return resolveRegistryTree(names, { config })
}

export async function getShadcnRegistryIndex(): Promise<RegistryItem[]> {
  return fetchRegistry([`${REGISTRY_URL}/index.json`])
}

export async function getRegistryStyles(): Promise<{ name: string; label: string }[]> {
  return [
    { name: "default", label: "Default" },
    { name: "new-york", label: "New York" },
  ]
}

export async function getRegistryBaseColors() {
  return [
    { name: "neutral", label: "Neutral" },
    { name: "zinc", label: "Zinc" },
    { name: "slate", label: "Slate" },
    { name: "stone", label: "Stone" },
  ]
}
