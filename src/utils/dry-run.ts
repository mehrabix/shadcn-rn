export interface DryRunFile {
  path: string
  content: string
  type: "create" | "update" | "delete"
}

export function formatDryRunOutput(files: DryRunFile[]): string {
  const lines: string[] = []

  for (const file of files) {
    const icon =
      file.type === "create"
        ? "+"
        : file.type === "update"
        ? "~"
        : "-"
    lines.push(`  ${icon} ${file.path}`)
  }

  return lines.join("\n")
}
