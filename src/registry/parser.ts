export interface ParsedRegistryItem {
  registry: string
  item: string
}

const REGISTRY_ITEM_PATTERN = /^(@[a-zA-Z0-9](?:[a-zA-Z0-9-_]*[a-zA-Z0-9])?)\/([^\s]+)$/

export function parseRegistryAndItemFromString(input: string): ParsedRegistryItem | null {
  const match = input.match(REGISTRY_ITEM_PATTERN)
  if (!match) {
    return null
  }
  return {
    registry: match[1],
    item: match[2],
  }
}

export function isRegistryItemString(input: string): boolean {
  return REGISTRY_ITEM_PATTERN.test(input)
}
