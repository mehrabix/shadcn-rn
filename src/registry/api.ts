import { registryItemSchema } from "./schema"
import type { RegistryItem } from "./schema"

let registryIcons: Record<string, Record<string, string>> | null = null

export async function getRegistryIcons(): Promise<
  Record<string, Record<string, string>>
> {
  if (registryIcons) {
    return registryIcons
  }

  registryIcons = {}
  return registryIcons
}
