import * as fs from "fs/promises"
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
    let output: string
    try {
      output = await fs.readFile(cssFilepath, "utf-8")
    } catch {
      output = ""
    }

    for (const [selector, properties] of Object.entries(css)) {
      if (typeof properties !== "object" || properties === null) continue

      const existingBlock = findSelectorBlock(output, selector)
      if (existingBlock) {
        let updatedBlock = existingBlock
        for (const [prop, value] of Object.entries(
          properties as Record<string, string>
        )) {
          const propRegex = new RegExp(
            `${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:[^;]+;`
          )
          if (propRegex.test(updatedBlock)) {
            updatedBlock = updatedBlock.replace(propRegex, `${prop}: ${value};`)
          } else {
            const insertPos = updatedBlock.lastIndexOf("}")
            updatedBlock =
              updatedBlock.slice(0, insertPos) +
              `  ${prop}: ${value};\n` +
              updatedBlock.slice(insertPos)
          }
        }
        output = output.replace(existingBlock, updatedBlock)
      } else {
        const declarations = Object.entries(
          properties as Record<string, string>
        )
          .map(([prop, value]) => `  ${prop}: ${value};`)
          .join("\n")
        const newBlock = `${selector} {\n${declarations}\n}`
        if (output.length > 0) {
          output += `\n\n${newBlock}`
        } else {
          output = newBlock
        }
      }
    }

    await fs.writeFile(cssFilepath, output)
    cssSpinner.succeed()
  } catch {
    cssSpinner.fail()
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
