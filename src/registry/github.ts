import type { RegistryItem } from "./schema"
import { parseGitHubUrl, resolveGitHubRef, fetchGitHubRegistryItem } from "./github-ref"
import { RegistryFetchError, RegistryNotFoundError } from "./errors"

export async function fetchRegistryFromGitHub(
  url: string
): Promise<RegistryItem[]> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) {
    throw new RegistryFetchError(url)
  }

  const { owner, repo, ref } = parsed
  const resolvedRef = await resolveGitHubRef(owner, repo, ref)

  const itemPath = "registry.json"
  const data = await fetchGitHubRegistryItem(owner, repo, resolvedRef, itemPath)

  if (data && typeof data === "object" && "items" in data) {
    return (data as { items: RegistryItem[] }).items
  }

  return []
}

export async function fetchGitHubRegistryItemByName(
  owner: string,
  repo: string,
  ref: string,
  itemName: string
): Promise<RegistryItem> {
  const path = `registry/${itemName}.json`
  const data = await fetchGitHubRegistryItem(owner, repo, ref, path)

  return data as RegistryItem
}

export async function getGitHubRegistryIndex(
  owner: string,
  repo: string,
  ref?: string
): Promise<RegistryItem[]> {
  const resolvedRef = await resolveGitHubRef(owner, repo, ref)
  const data = await fetchGitHubRegistryItem(owner, repo, resolvedRef, "registry/index.json")

  if (Array.isArray(data)) {
    return data as RegistryItem[]
  }

  return []
}
