import { promises as fs } from "fs"
import * as path from "path"
import type { Config } from "../../registry/schema"
import { highlighter } from "../highlighter"
import { spinner } from "../spinner"

export async function updateTailwindContent(
  content: string[] | undefined,
  config: Config,
  options: { silent?: boolean } = {}
): Promise<void> {
  if (!content || content.length === 0) {
    return
  }

  const configPath = path.resolve(
    config.resolvedPaths.cwd,
    "tailwind.config.js"
  )

  const contentSpinner = spinner(
    `Updating content paths in ${highlighter.info("tailwind.config.js")}`,
    { silent: options.silent }
  ).start()

  try {
    let configContent: string
    try {
      configContent = await fs.readFile(configPath, "utf-8")
    } catch {
      contentSpinner.fail()
      return
    }

    const contentArrayRegex = /content\s*:\s*\[([^\]]*)\]/
    const match = configContent.match(contentArrayRegex)

    if (match) {
      const existingEntries = match[1]
        .split(",")
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter(Boolean)

      const newEntries = content.filter((c) => !existingEntries.includes(c))

      if (newEntries.length === 0) {
        contentSpinner.succeed("Content paths already up to date")
        return
      }

      const allEntries = [...existingEntries, ...newEntries]
      const formattedEntries = allEntries
        .map((e) => `      '${e}'`)
        .join(",\n")

      const newContentArray = `content: [\n${formattedEntries},\n    ]`
      configContent = configContent.replace(contentArrayRegex, newContentArray)
    } else {
      const contentEntries = content.map((c) => `      '${c}'`).join(",\n")
      const contentBlock = `  content: [\n${contentEntries},\n  ],`

      const themeMatch = configContent.match(/theme\s*:\s*\{/)
      if (themeMatch) {
        configContent = configContent.replace(
          themeMatch[0],
          `${contentBlock}\n  ${themeMatch[0]}`
        )
      } else {
        const moduleMatch = configContent.match(/module\.exports\s*=\s*\{/)
        if (moduleMatch) {
          configContent = configContent.replace(
            moduleMatch[0],
            `module.exports = {\n${contentBlock},`
          )
        }
      }
    }

    await fs.writeFile(configPath, configContent)
    contentSpinner.succeed()
  } catch {
    contentSpinner.fail()
  }
}
