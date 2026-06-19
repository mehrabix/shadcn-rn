import * as fs from "fs/promises"
import * as path from "path"
import { highlighter } from "./highlighter"
import { logger } from "./logger"

export interface DryRunFile {
  path: string
  content: string
  type: "create" | "update" | "delete"
}

export function formatDryRunResult(
  files: DryRunFile[],
  options: { cwd: string }
): string {
  const lines: string[] = []

  for (const file of files) {
    const relativePath = path.relative(options.cwd, file.path)
    const prefix =
      file.type === "create"
        ? highlighter.success("+ ")
        : file.type === "update"
          ? highlighter.warning("~ ")
          : highlighter.error("- ")

    lines.push(`${prefix}${relativePath}`)

    if (file.content) {
      const contentLines = file.content.split("\n")
      for (const line of contentLines.slice(0, 5)) {
        lines.push(`  ${line}`)
      }
      if (contentLines.length > 5) {
        lines.push(`  ... ${contentLines.length - 5} more lines`)
      }
    }
  }

  return lines.join("\n")
}

export function resolveFilterPath(
  filePath: string,
  filter: string
): boolean {
  if (!filter) {
    return true
  }

  return filePath.includes(filter)
}
