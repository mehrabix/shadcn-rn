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
    let configContent = ""
    try {
      configContent = await fs.readFile(configPath, "utf-8")
    } catch {
      return
    }

    await fs.writeFile(configPath, configContent)
    contentSpinner.succeed()
  } catch {
    contentSpinner.fail()
  }
}
