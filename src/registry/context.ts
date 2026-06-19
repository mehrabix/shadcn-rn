export type RegistryHeaders = Record<string, Record<string, string>>

let registryHeaders: RegistryHeaders = {}

export function setRegistryHeaders(headers: RegistryHeaders): void {
  registryHeaders = { ...registryHeaders, ...headers }
}

export function getRegistryHeadersFromContext(
  url: string
): Record<string, string> {
  return registryHeaders[url] || {}
}

export function clearRegistryContext(): void {
  registryHeaders = {}
}
