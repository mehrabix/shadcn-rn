import * as fs from "fs/promises"
import type { Config } from "../../registry/schema"
import { highlighter } from "../highlighter"
import { spinner } from "../spinner"

export async function updateCssVars(
  cssVars: Record<string, Record<string, string>> | undefined,
  config: Config,
  options: { silent?: boolean } = {}
): Promise<void> {
  if (!cssVars || Object.keys(cssVars).length === 0) {
    return
  }

  const cssFilepath = config.resolvedPaths.nativewindCss
  if (!cssFilepath) {
    return
  }

  const cssVarsSpinner = spinner(
    `Updating CSS variables in ${highlighter.info(cssFilepath)}`,
    { silent: options.silent }
  ).start()

  try {
    let output = await fs.readFile(cssFilepath, "utf-8")

    for (const [selector, vars] of Object.entries(cssVars)) {
      const selectorName = selector === "light" ? ":root" : `.${selector}`

      for (const [key, value] of Object.entries(vars)) {
        const prop = `--${key.replace(/^--/, "")}`
        const decl = `  ${prop}: ${value};`

        const existingRule = output.match(
          new RegExp(`${selectorName}\\s*\\{[^}]*${prop}[^}]*\\}`, "s")
        )

        if (existingRule) {
          const updatedRule = existingRule[0].replace(
            new RegExp(`${prop}\\s*:[^;]+;`),
            `${prop}: ${value};`
          )
          output = output.replace(existingRule[0], updatedRule)
        } else {
          const rule = `${selectorName} {\n${decl}\n}`
          output += `\n\n${rule}`
        }
      }
    }

    await fs.writeFile(cssFilepath, output)
    cssVarsSpinner.succeed()
  } catch {
    cssVarsSpinner.fail()
  }
}
