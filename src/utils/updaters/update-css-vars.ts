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
    let output: string
    try {
      output = await fs.readFile(cssFilepath, "utf-8")
    } catch {
      output = ""
    }

    for (const [selector, vars] of Object.entries(cssVars)) {
      const selectorName = selector === "light" ? ":root" : `.${selector}`

      let selectorBlock = findSelectorBlock(output, selectorName)

      for (const [key, value] of Object.entries(vars)) {
        const prop = `--${key.replace(/^--/, "")}`

        if (selectorBlock) {
          const propRegex = new RegExp(
            `${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:[^;]+;`
          )
          if (propRegex.test(selectorBlock)) {
            selectorBlock = selectorBlock.replace(propRegex, `${prop}: ${value};`)
            output = output.replace(
              findSelectorBlock(output, selectorName) || "",
              selectorBlock
            )
          } else {
            const insertPos = selectorBlock.lastIndexOf("}")
            const newDecl = `  ${prop}: ${value};\n`
            selectorBlock =
              selectorBlock.slice(0, insertPos) +
              newDecl +
              selectorBlock.slice(insertPos)
            const oldBlock = findSelectorBlock(output, selectorName)
            if (oldBlock) {
              output = output.replace(oldBlock, selectorBlock)
            }
          }
        } else {
          const newBlock = `${selectorName} {\n  ${prop}: ${value};\n}`
          if (output.length > 0) {
            output += `\n\n${newBlock}`
          } else {
            output = newBlock
          }
        }
      }
    }

    await fs.writeFile(cssFilepath, output)
    cssVarsSpinner.succeed()
  } catch {
    cssVarsSpinner.fail()
  }
}

function findSelectorBlock(css: string, selector: string): string | null {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`${escapedSelector}\\s*\\{`, "g")
  const match = regex.exec(css)
  if (!match) return null

  let depth = 0
  let start = match.index + match[0].length - 1
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++
    if (css[i] === "}") depth--
    if (depth === 0) {
      return css.slice(match.index, i + 1)
    }
  }
  return null
}
