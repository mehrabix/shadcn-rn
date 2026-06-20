import { promises as fs } from "fs"
import { tmpdir } from "os"
import path from "path"
import type { Config } from "../get-config"
import { transformCssVars } from "./transform-css-vars"
import { transformIcons } from "./transform-icons"
import { transformImport } from "./transform-import"
import { transformJsx } from "./transform-jsx"
import { transformCleanup } from "./transform-cleanup"
import { transformRtl } from "./transform-rtl"
import { transformTwPrefixes } from "./transform-tw-prefix"
import { transformFont } from "./transform-font"
import { transformRsc } from "./transform-rsc"
import { transformRender } from "./transform-render"
import { transformMenu } from "./transform-menu"
import { transformAsChild } from "./transform-aschild"
import { Project, ScriptKind, type SourceFile } from "ts-morph"

export type TransformContext = {
  aliases: Record<string, string>
  style: string
  tsx: boolean
}

export type TransformOpts = {
  filename: string
  raw: string
  config: Config
  baseColor?: { name: string; label: string }
  transformJsx?: boolean
  isRemote?: boolean
  supportedFontMarkers?: string[]
}

export type Transformer<Output = SourceFile> = (
  opts: TransformOpts & {
    sourceFile: SourceFile
  }
) => Promise<Output>

const project = new Project({
  compilerOptions: {},
})

async function createTempSourceFile(filename: string) {
  const dir = await fs.mkdtemp(path.join(tmpdir(), "shadcn-rn-"))
  return path.join(dir, filename)
}

export async function transform(
  opts: TransformOpts,
  transformers: Transformer[] = [
    transformRsc,
    transformImport,
    transformCssVars,
    transformTwPrefixes,
    transformRtl,
    transformIcons,
    transformFont,
    transformRender,
    transformMenu,
    transformAsChild,
    transformCleanup,
  ]
) {
  const tempFile = await createTempSourceFile(opts.filename)
  const sourceFile = project.createSourceFile(tempFile, opts.raw, {
    scriptKind: ScriptKind.TSX,
  })

  for (const transformer of transformers) {
    await transformer({ sourceFile, ...opts })
  }

  if (opts.transformJsx) {
    return await transformJsx({
      sourceFile,
      ...opts,
    })
  }

  return sourceFile.getText()
}

export function transformImportString(
  sourceCode: string,
  context: TransformContext
): string {
  let result = sourceCode
  for (const [alias, aliasPath] of Object.entries(context.aliases)) {
    const regex = new RegExp(`from ["']@/${alias}["']`, "g")
    result = result.replace(regex, `from "${aliasPath}"`)
  }
  return result
}

export function transformRscString(
  sourceCode: string,
  options: { rsc?: boolean }
): string {
  if (options.rsc) {
    if (!sourceCode.includes('"use client"')) {
      return `"use client"\n\n${sourceCode}`
    }
  } else {
    return sourceCode.replace(/^"use client"\n\n/, "")
  }
  return sourceCode
}

export function transformCssVarsString(
  sourceCode: string,
  cssVars: Record<string, string>
): string {
  let result = sourceCode
  for (const [varName, value] of Object.entries(cssVars)) {
    const regex = new RegExp(`var\\(--${varName}\\)`, "g")
    result = result.replace(regex, value)
  }
  return result
}

export function transformTwPrefixesString(
  sourceCode: string,
  prefix: string
): string {
  if (!prefix) return sourceCode
  return sourceCode.replace(
    /className=["']([^"']*)["']/g,
    (_, classes: string) => {
      const prefixed = classes
        .split(" ")
        .map((cls: string) => (cls.startsWith(prefix) ? cls : `${prefix}${cls}`))
        .join(" ")
      return `className="${prefixed}"`
    }
  )
}

export function transformCleanupString(sourceCode: string): string {
  const lines = sourceCode.split("\n")
  const filtered = lines.filter((line) => {
    const trimmed = line.trim()
    if (trimmed === "") return true
    if (trimmed.startsWith("//") && trimmed.includes("TODO")) return false
    return true
  })
  return filtered.join("\n")
}
