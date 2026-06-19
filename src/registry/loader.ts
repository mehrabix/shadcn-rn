import * as fs from "fs/promises"
import * as path from "path"
import { z } from "zod"
import { registrySchema, type Registry, type RegistryItem } from "./schema"
import { RegistryValidationError } from "./errors"

export interface LoadRegistryOptions {
  cwd: string
  include?: string[]
}

export async function loadRegistry(
  options: LoadRegistryOptions
): Promise<Registry> {
  const { cwd, include } = options

  const registryPath = path.join(cwd, "registry.json")
  const content = await fs.readFile(registryPath, "utf-8")
  const data = JSON.parse(content)

  if (include) {
    data.include = include
  }

  const result = registrySchema.safeParse(data)
  if (!result.success) {
    throw new RegistryValidationError(
      `Invalid registry: ${result.error.message}`
    )
  }

  return result.data
}

export async function loadRegistryItem(
  name: string,
  options: { cwd: string }
): Promise<RegistryItem> {
  const { cwd } = options

  const itemPath = path.join(cwd, "registry", `${name}.json`)
  const content = await fs.readFile(itemPath, "utf-8")
  const data = JSON.parse(content)

  return data as RegistryItem
}

export async function readRegistryWithIncludes(
  registryPath: string,
  options: { maxDepth?: number } = {}
): Promise<Registry> {
  const { maxDepth = 32 } = options

  const content = await fs.readFile(registryPath, "utf-8")
  const data = JSON.parse(content)

  if (data.include && Array.isArray(data.include)) {
    const includedItems: RegistryItem[] = []
    const visited = new Set<string>()

    for (const includePath of data.include) {
      const resolved = await resolveIncludePath(includePath, registryPath)

      if (visited.has(resolved)) {
        continue
      }
      visited.add(resolved)

      const includeContent = await fs.readFile(resolved, "utf-8")
      const includeData = JSON.parse(includeContent)

      if (includeData.items) {
        includedItems.push(...includeData.items)
      }
    }

    data.items = [...(data.items || []), ...includedItems]
    delete data.include
  }

  const result = registrySchema.safeParse(data)
  if (!result.success) {
    throw new RegistryValidationError(
      `Invalid registry: ${result.error.message}`
    )
  }

  return result.data
}

async function resolveIncludePath(
  includePath: string,
  basePath: string
): Promise<string> {
  if (includePath.startsWith("..") || includePath.startsWith("/")) {
    throw new RegistryValidationError(
      `Invalid include path: ${includePath}`
    )
  }

  const baseDir = path.dirname(basePath)
  return path.resolve(baseDir, includePath)
}
