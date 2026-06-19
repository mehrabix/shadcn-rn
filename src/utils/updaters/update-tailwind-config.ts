import { promises as fs } from "fs"
import * as path from "path"
import type { Config } from "../../registry/schema"
import { highlighter } from "../highlighter"
import { spinner } from "../spinner"

export async function updateTailwindConfig(
  tailwindConfig: Record<string, unknown> | undefined,
  config: Config,
  options: { silent?: boolean } = {}
): Promise<void> {
  if (!tailwindConfig || Object.keys(tailwindConfig).length === 0) {
    return
  }

  const configPath = path.resolve(
    config.resolvedPaths.cwd,
    "tailwind.config.js"
  )

  const configSpinner = spinner(
    `Updating ${highlighter.info("tailwind.config.js")}`,
    { silent: options.silent }
  ).start()

  try {
    let content = ""
    try {
      content = await fs.readFile(configPath, "utf-8")
    } catch {
      content = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}`
    }

    await fs.writeFile(configPath, content)
    configSpinner.succeed()
  } catch {
    configSpinner.fail()
  }
}
