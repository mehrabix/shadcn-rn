import { type Transformer } from "./transformers"

export const transformCssVars: Transformer = async ({ sourceFile, config }) => {
  return sourceFile
}
