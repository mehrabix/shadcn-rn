export function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export function isLocalFile(str: string): boolean {
  return (
    str.startsWith("/") ||
    str.startsWith("./") ||
    str.startsWith("~/") ||
    str.startsWith("..")
  )
}

export function isGitHubUrl(str: string): boolean {
  return (
    str.startsWith("https://github.com/") ||
    str.startsWith("github.com/")
  )
}

export function deduplicateFilesByTarget<
  T extends { target?: string; path: string }
>(files: T[]): T[] {
  const seen = new Map<string, T>()

  for (const file of files) {
    const key = file.target || file.path
    seen.set(key, file)
  }

  return Array.from(seen.values())
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/")
}

export function getFileName(path: string): string {
  const parts = path.split("/")
  return parts[parts.length - 1]
}

export function getFileExtension(path: string): string {
  const fileName = getFileName(path)
  const dotIndex = fileName.lastIndexOf(".")
  if (dotIndex === -1) {
    return ""
  }
  return fileName.substring(dotIndex + 1)
}

export function joinPaths(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/+$/, "")
      }
      if (index === parts.length - 1) {
        return part.replace(/^\/+/, "")
      }
      return part.replace(/^\/+|\/+$/g, "")
    })
    .filter(Boolean)
    .join("/")
}
