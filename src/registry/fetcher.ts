import { z } from "zod"
import {
  RegistryFetchError,
  RegistryNotFoundError,
  RegistryUnauthorizedError,
  RegistryForbiddenError,
  RegistryParseError,
  RegistryItemNotFoundError,
} from "./errors"
import { registryItemSchema, type RegistryItem } from "./schema"
import { getRegistryHeadersFromContext } from "./context"

export interface FetchRegistryOptions {
  useCache?: boolean
  headers?: Record<string, string>
}

const cache = new Map<string, unknown>()

export async function fetchRegistry(
  paths: string[],
  options: FetchRegistryOptions = {}
): Promise<RegistryItem[]> {
  const { useCache = true, headers = {} } = options

  const results = await Promise.all(
    paths.map(async (path) => {
      if (useCache && cache.has(path)) {
        return cache.get(path) as RegistryItem
      }

      const contextHeaders = getRegistryHeadersFromContext(path)
      const mergedHeaders = { ...contextHeaders, ...headers }

      try {
        const response = await fetch(path, {
          headers: {
            Accept: "application/json",
            "User-Agent": "shadcn-rn",
            ...mergedHeaders,
          },
        })

        if (!response.ok) {
          switch (response.status) {
            case 401:
              throw new RegistryUnauthorizedError(path)
            case 403:
              throw new RegistryForbiddenError(path)
            case 404:
              throw new RegistryNotFoundError(path)
            default:
              throw new RegistryFetchError(path)
          }
        }

        const data = await response.json()
        const validated = registryItemSchema.safeParse(data)

        if (!validated.success) {
          throw new RegistryParseError(
            `Invalid registry item at "${path}": ${validated.error.message}`
          )
        }

        if (useCache) {
          cache.set(path, validated.data)
        }

        return validated.data
      } catch (error) {
        if (error instanceof RegistryFetchError || error instanceof RegistryNotFoundError) {
          throw error
        }
        throw new RegistryFetchError(path, error as Error)
      }
    })
  )

  return results
}

export async function fetchRegistryLocal(
  filePath: string
): Promise<RegistryItem> {
  const fs = await import("fs/promises")
  const path = await import("path")

  const resolvedPath = filePath.startsWith("~")
    ? path.join(process.env.HOME || process.env.USERPROFILE || "", filePath.slice(1))
    : filePath

  try {
    const content = await fs.readFile(resolvedPath, "utf-8")
    const data = JSON.parse(content)
    const validated = registryItemSchema.safeParse(data)

    if (!validated.success) {
      throw new RegistryParseError(
        `Invalid registry item at "${resolvedPath}": ${validated.error.message}`
      )
    }

    return validated.data
  } catch (error) {
    if (error instanceof RegistryParseError) {
      throw error
    }
    throw new RegistryItemNotFoundError(filePath)
  }
}

export function clearCache(): void {
  cache.clear()
}
