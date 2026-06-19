import { execSync } from "child_process"
import { RegistryFetchError } from "./errors"

export interface GitHubRef {
  owner: string
  repo: string
  ref: string
}

export function parseGitHubUrl(url: string): GitHubRef | null {
  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/(.+)$/,
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/,
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/,
    /^github\.com\/([^/]+)\/([^/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
        ref: match[3] || "main",
      }
    }
  }

  return null
}

export async function resolveGitHubRef(
  owner: string,
  repo: string,
  ref?: string
): Promise<string> {
  if (ref && ref.match(/^[a-f0-9]{40}$/)) {
    return ref
  }

  const targetRef = ref || "main"

  try {
    const output = execSync(
      `git ls-remote https://github.com/${owner}/${repo}.git ${targetRef}`,
      { encoding: "utf-8", timeout: 10000 }
    )

    const lines = output.trim().split("\n")
    if (lines.length > 0) {
      const [hash] = lines[0].split("\t")
      return hash
    }
  } catch {
    // Fall back to the ref as-is
  }

  return targetRef
}

export async function fetchGitHubRegistryItem(
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<unknown> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new RegistryFetchError(url)
    }
    return await response.json()
  } catch (error) {
    if (error instanceof RegistryFetchError) {
      throw error
    }
    throw new RegistryFetchError(url, error as Error)
  }
}
