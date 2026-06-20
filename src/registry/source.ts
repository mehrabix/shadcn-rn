import { isUrl, isLocalFile, isGitHubUrl } from "./utils"
import { parseRegistryAndItemFromString } from "./parser"
import { fetchRegistry, fetchRegistryLocal } from "./fetcher"
import { fetchRegistryFromGitHub } from "./github"
import { buildUrlAndHeadersForRegistryItem } from "./builder"
import type { RegistryItem, Config } from "./schema"
import { configWithDefaults } from "./config"

export type SourceType = "url" | "file" | "github" | "registry" | "unknown"

export interface ResolvedSource {
  type: SourceType
  items: RegistryItem[]
}

export async function resolveSource(
  input: string,
  config: Config
): Promise<ResolvedSource> {
  if (isUrl(input)) {
    const items = await fetchRegistry([input])
    return { type: "url", items }
  }

  if (isLocalFile(input)) {
    const item = await fetchRegistryLocal(input)
    return { type: "file", items: [item] }
  }

  if (isGitHubUrl(input)) {
    const items = await fetchRegistryFromGitHub(input)
    return { type: "github", items }
  }

  const parsed = parseRegistryAndItemFromString(input)
  if (parsed) {
    const resolvedConfig = configWithDefaults(config)
    const registries = resolvedConfig.registries
    if (!registries) {
      return { type: "unknown", items: [] }
    }
    const urlInfo = buildUrlAndHeadersForRegistryItem(
      input,
      registries
    )

    if (urlInfo) {
      const items = await fetchRegistry([urlInfo.url], {
        headers: urlInfo.headers,
      })
      return { type: "registry", items }
    }
  }

  return { type: "unknown", items: [] }
}
