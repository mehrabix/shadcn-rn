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
    let content: string
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

    for (const [key, value] of Object.entries(tailwindConfig)) {
      if (key === "theme" && typeof value === "object" && value !== null) {
        content = mergeThemeExtension(content, value as Record<string, unknown>)
      } else if (key === "plugins" && Array.isArray(value)) {
        content = mergePlugins(content, value)
      } else if (key === "darkMode") {
        content = setConfigProperty(content, "darkMode", JSON.stringify(value))
      }
    }

    await fs.writeFile(configPath, content)
    configSpinner.succeed()
  } catch {
    configSpinner.fail()
  }
}

function mergeThemeExtension(
  content: string,
  theme: Record<string, unknown>
): string {
  const extendMatch = content.match(/extend\s*:\s*\{/)
  if (extendMatch) {
    for (const [key, value] of Object.entries(theme)) {
      const propRegex = new RegExp(`${key}\\s*:\\s*[^,}]+`)
      if (propRegex.test(content)) {
        content = content.replace(
          propRegex,
          `${key}: ${JSON.stringify(value)}`
        )
      } else {
        const insertPos = content.indexOf(extendMatch[0]) + extendMatch[0].length
        content =
          content.slice(0, insertPos) +
          `\n      ${key}: ${JSON.stringify(value)},` +
          content.slice(insertPos)
      }
    }
  } else {
    const themeMatch = content.match(/theme\s*:\s*\{/)
    if (themeMatch) {
      const insertPos = content.indexOf(themeMatch[0]) + themeMatch[0].length
      const extendBlock = `\n    extend: ${JSON.stringify(theme, null, 6).replace(/"/g, "'")},`
      content =
        content.slice(0, insertPos) +
        extendBlock +
        content.slice(insertPos)
    }
  }
  return content
}

function mergePlugins(content: string, plugins: unknown[]): string {
  const pluginsMatch = content.match(/plugins\s*:\s*\[([^\]]*)\]/)
  if (pluginsMatch) {
    const existing = pluginsMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const newPlugins = plugins
      .map((p) => {
        const str = typeof p === "string" ? p : JSON.stringify(p)
        return str
      })
      .filter((p) => !existing.includes(p))

    if (newPlugins.length === 0) return content

    const allPlugins = [...existing, ...newPlugins]
    content = content.replace(
      /plugins\s*:\s*\[[^\]]*\]/,
      `plugins: [${allPlugins.join(", ")}]`
    )
  } else {
    const moduleMatch = content.match(/module\.exports\s*=\s*\{/)
    if (moduleMatch) {
      const insertPos = content.lastIndexOf("}")
      content =
        content.slice(0, insertPos) +
        `  plugins: [${plugins.map((p) => typeof p === "string" ? p : JSON.stringify(p)).join(", ")}],\n` +
        content.slice(insertPos)
    }
  }
  return content
}

function setConfigProperty(
  content: string,
  key: string,
  value: string
): string {
  const regex = new RegExp(`${key}\\s*:\\s*[^,\\n]+`)
  if (regex.test(content)) {
    return content.replace(regex, `${key}: ${value}`)
  }
  const moduleMatch = content.match(/module\.exports\s*=\s*\{/)
  if (moduleMatch) {
    const insertPos = content.indexOf(moduleMatch[0]) + moduleMatch[0].length
    return (
      content.slice(0, insertPos) +
      `\n  ${key}: ${value},` +
      content.slice(insertPos)
    )
  }
  return content
}
