import { createStyleMap, applyStyleMap } from "./create-style-map"
import type { StyleMap } from "./create-style-map"

export function transformStyleMap(
  sourceCode: string,
  css: string
): string {
  const styleMap = createStyleMap(css)
  return applyStyleMap(sourceCode, styleMap)
}

export { createStyleMap, applyStyleMap }
export type { StyleMap }
