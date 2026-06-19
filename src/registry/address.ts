export type AddressScheme = "shadcn-rn" | "namespace" | "url" | "file" | "github"

export interface ResolvedAddress {
  scheme: AddressScheme
  registry?: string
  item: string
  url?: string
  filePath?: string
}

export function resolveItemAddress(
  input: string,
  registries: Record<string, string>
): ResolvedAddress {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return {
      scheme: "url",
      item: input,
      url: input,
    }
  }

  if (input.startsWith("/") || input.startsWith("~/") || input.startsWith("./")) {
    return {
      scheme: "file",
      item: input,
      filePath: input,
    }
  }

  if (input.startsWith("@shadcn-rn/")) {
    return {
      scheme: "shadcn-rn",
      registry: "@shadcn-rn",
      item: input.replace("@shadcn-rn/", ""),
    }
  }

  const slashIndex = input.indexOf("/")
  if (slashIndex > 0 && input.startsWith("@")) {
    const namespace = input.substring(0, slashIndex)
    if (registries[namespace]) {
      return {
        scheme: "namespace",
        registry: namespace,
        item: input.substring(slashIndex + 1),
      }
    }
  }

  return {
    scheme: "shadcn-rn",
    registry: "@shadcn-rn",
    item: input,
  }
}
