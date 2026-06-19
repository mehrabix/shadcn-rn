export type RegistryHeaders = Record<string, Record<string, string>>

let registryHeaders: RegistryHeaders = {}

export function setRegistryHeaders(headers: RegistryHeaders): void {
  for (const [url, urlHeaders] of Object.entries(headers)) {
    registryHeaders[url] = {
      ...(registryHeaders[url] || {}),
      ...urlHeaders,
    }
  }
}

export function getRegistryHeadersFromContext(
  url: string
): Record<string, string> {
  return registryHeaders[url] || {}
}

export function clearRegistryContext(): void {
  registryHeaders = {}
}
