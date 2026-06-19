import { transformStyleMap } from "./transform-style-map"

export function transform(
  sourceCode: string,
  css: string
): string {
  return transformStyleMap(sourceCode, css)
}
