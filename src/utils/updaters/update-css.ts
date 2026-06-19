import * as fs from "fs/promises"
import * as path from "path"
import type { Config } from "../../registry/schema"
import { highlighter } from "../highlighter"
import { spinner } from "../spinner"

export async function updateCss(
  css: Record<string, unknown> | undefined,
  config: Config,
  options: { silent?: boolean } = {}
): Promise<void> {
  if (!css || Object.keys(css).length === 0) {
    return
  }

  const cssFilepath = config.resolvedPaths.nativewindCss
  if (!cssFilepath) {
    return
  }

  const cssSpinner = spinner(
    `Updating ${highlighter.info(cssFilepath)}`,
    { silent: options.silent }
  ).start()

  try {
    let output = await fs.readFile(cssFilepath, "utf-8")

    for (const [selector, properties] of Object.entries(css)) {
      if (typeof properties === "object" && properties !== null) {
        for (const [prop, value] of Object.entries(
          properties as Record<string, string>
        )) {
          const declaration = `  ${prop}: ${value};`
          const rule = `${selector} {\n${declaration}\n}`

          if (!output.includes(selector)) {
            output += `\n\n${rule}`
          }
        }
      }
    }

    await fs.writeFile(cssFilepath, output)
    cssSpinner.succeed()
  } catch {
    cssSpinner.fail()
  }
}
