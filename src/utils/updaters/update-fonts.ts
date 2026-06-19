import { promises as fs } from "fs"
import type { Config } from "../../registry/schema"
import { highlighter } from "../highlighter"
import { spinner } from "../spinner"

export async function updateFonts(
  fonts: Array<{ name: string; family: string; variable: string }> | undefined,
  config: Config,
  options: { silent?: boolean } = {}
): Promise<void> {
  if (!fonts || fonts.length === 0) {
    return
  }

  const cssFilepath = config.resolvedPaths.nativewindCss
  if (!cssFilepath) {
    return
  }

  const fontsSpinner = spinner(
    `Updating fonts in ${highlighter.info(cssFilepath)}`,
    { silent: options.silent }
  ).start()

  try {
    let output = await fs.readFile(cssFilepath, "utf-8")

    for (const font of fonts) {
      const varName = font.variable.replace("--", "")
      if (!output.includes(varName)) {
        output += `\n\n:root {\n  ${font.variable}: ${font.family};\n}`
      }
    }

    await fs.writeFile(cssFilepath, output)
    fontsSpinner.succeed()
  } catch {
    fontsSpinner.fail()
  }
}
