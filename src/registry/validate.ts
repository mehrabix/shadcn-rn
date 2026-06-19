import type { Registry, RegistryItem } from "./schema"
import { registrySchema } from "./schema"
import { RegistryValidationError } from "./errors"

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateRegistry(data: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  const parsed = registrySchema.safeParse(data)
  if (!parsed.success) {
    result.valid = false
    result.errors.push(`Invalid registry: ${parsed.error.message}`)
    return result
  }

  const registry = parsed.data

  const names = new Set<string>()
  for (const item of registry.items) {
    if (names.has(item.name)) {
      result.warnings.push(`Duplicate item name: ${item.name}`)
    }
    names.add(item.name)

    if (item.files) {
      const filePaths = new Set<string>()
      for (const file of item.files) {
        if (filePaths.has(file.path)) {
          result.warnings.push(`Duplicate file path in item "${item.name}": ${file.path}`)
        }
        filePaths.add(file.path)
      }
    }
  }

  return result
}

export function validateRegistryItem(data: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  const item = data as RegistryItem

  if (!item.name) {
    result.valid = false
    result.errors.push("Item must have a name")
  }

  if (item.files) {
    for (const file of item.files) {
      if (!file.path) {
        result.valid = false
        result.errors.push(`File in item "${item.name}" must have a path`)
      }
    }
  }

  return result
}
