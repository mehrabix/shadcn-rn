export interface StyleMap {
  [className: string]: string
}

export function createStyleMap(css: string): StyleMap {
  const styleMap: StyleMap = {}
  const lines = css.split("\n")

  for (const line of lines) {
    const match = line.match(/\.([\w-]+)\s*\{([^}]+)\}/)
    if (match) {
      const className = match[1]
      const styles = match[2].trim()
      styleMap[className] = styles
    }
  }

  return styleMap
}

export function applyStyleMap(
  sourceCode: string,
  styleMap: StyleMap
): string {
  let result = sourceCode

  for (const [className, styles] of Object.entries(styleMap)) {
    const regex = new RegExp(`className=["']([^"']*)\\b${className}\\b([^"']*)["']`, "g")
    result = result.replace(regex, (_, before: string, after: string) => {
      return `className="${before}${styles}${after}"`
    })
  }

  return result
}
