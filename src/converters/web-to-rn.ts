import { convertHtmlTag, EVENT_HANDLERS, WEB_ATTR_TO_RN } from "./html-to-rn"
import { convertTailwindClasses } from "./tailwind-to-nativewind"
import type { Config } from "../registry/schema"

export interface ConversionResult {
  code: string
  warnings: string[]
}

export function convertWebComponentToRN(
  sourceCode: string,
  _config: Config
): ConversionResult {
  const warnings: string[] = []
  let result = sourceCode

  result = convertImports(result, warnings)
  result = convertElements(result, warnings)
  result = convertAttributes(result, warnings)
  result = convertEventHandlers(result, warnings)
  result = convertClassNameToStyle(result, warnings)
  result = removeUseClientDirective(result)

  return { code: result, warnings }
}

function removeUseClientDirective(code: string): string {
  return code.replace(/^"use client"\s*\n\s*/m, "")
}

function convertImports(code: string, _warnings: string[]): string {
  let result = code

  result = result.replace(
    /from\s+["']lucide-react["']/g,
    'from "@/components/ui/icon"'
  )

  result = result.replace(
    /import\s*\{([^}]+)\}\s*from\s+["']@\/components\/ui\/([^"']+)["']/g,
    (_, imports: string, module: string) => {
      const cleanedImports = imports
        .split(",")
        .map((i: string) => i.trim())
        .filter(Boolean)
        .join(", ")
      return `import { ${cleanedImports} } from "@/components/ui/${module}"`
    }
  )

  result = result.replace(
    /import\s*\{([^}]+)\}\s*from\s+["']@\/lib\/utils["']/g,
    (_, imports: string) => {
      const cleanedImports = imports
        .split(",")
        .map((i: string) => i.trim())
        .filter(Boolean)
        .join(", ")
      return `import { ${cleanedImports} } from "@/lib/utils"`
    }
  )

  return result
}

function convertElements(code: string, _warnings: string[]): string {
  let result = code

  const htmlTags = [
    "div",
    "span",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "button",
    "input",
    "textarea",
    "img",
    "ul",
    "ol",
    "li",
    "label",
    "select",
    "option",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "header",
    "footer",
    "nav",
    "main",
    "section",
    "article",
    "aside",
    "form",
    "hr",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "small",
    "code",
    "pre",
  ]

  for (const tag of htmlTags) {
    const rnComponent = convertHtmlTag(tag)
    const tagRegex = new RegExp(`<${tag}(\\s|>|/>)`, "g")
    const closeTagRegex = new RegExp(`</${tag}>`, "g")

    result = result.replace(tagRegex, (match) => {
      return match.replace(`<${tag}`, `<${rnComponent}`)
    })
    result = result.replace(closeTagRegex, (match) => {
      return match.replace(`</${tag}>`, `</${rnComponent}>`)
    })
  }

  return result
}

function convertAttributes(code: string, _warnings: string[]): string {
  let result = code

  for (const [webAttr, rnAttr] of Object.entries(WEB_ATTR_TO_RN)) {
    const attrRegex = new RegExp(`\\s${webAttr}=`, "g")
    result = result.replace(attrRegex, ` ${rnAttr}=`)
  }

  return result
}

function convertEventHandlers(code: string, warnings: string[]): string {
  let result = code

  for (const [webHandler, rnHandler] of Object.entries(EVENT_HANDLERS)) {
    if (webHandler !== rnHandler) {
      const handlerRegex = new RegExp(webHandler, "g")
      if (handlerRegex.test(result)) {
        result = result.replace(handlerRegex, rnHandler)
        warnings.push(
          `Converted ${webHandler} to ${rnHandler}. Review callback logic.`
        )
      }
    }
  }

  return result
}

function convertClassNameToStyle(code: string, _warnings: string[]): string {
  let result = code

  result = result.replace(
    /className=["']([^"']+)["']/g,
    (_, classes: string) => {
      const converted = convertTailwindClasses(classes)
      return `className="${converted}"`
    }
  )

  return result
}

export function convertStyleObjectToRN(
  style: Record<string, string | number>
): Record<string, string | number> {
  const rnStyle: Record<string, string | number> = {}

  const CSS_TO_RN: Record<string, string> = {
    "background-color": "backgroundColor",
    "border-color": "borderColor",
    "border-radius": "borderRadius",
    "border-width": "borderWidth",
    color: "color",
    "font-family": "fontFamily",
    "font-size": "fontSize",
    "font-style": "fontStyle",
    "font-weight": "fontWeight",
    height: "height",
    "line-height": "lineHeight",
    "margin-bottom": "marginBottom",
    "margin-left": "marginLeft",
    "margin-right": "marginRight",
    "margin-top": "marginTop",
    "max-height": "maxHeight",
    "max-width": "maxWidth",
    "min-height": "minHeight",
    "min-width": "minWidth",
    opacity: "opacity",
    "padding-bottom": "paddingBottom",
    "padding-left": "paddingLeft",
    "padding-right": "paddingRight",
    "padding-top": "paddingTop",
    "text-align": "textAlign",
    "text-decoration": "textDecorationLine",
    "text-decoration-color": "textDecorationColor",
    "text-decoration-style": "textDecorationStyle",
    "text-transform": "textTransform",
    width: "width",
    "writing-direction": "writingDirection",
  }

  for (const [key, value] of Object.entries(style)) {
    const rnKey = CSS_TO_RN[key] || key
    rnStyle[rnKey] = value
  }

  return rnStyle
}
