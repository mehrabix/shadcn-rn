import { type Transformer } from "./transformers"

export const transformJsx: Transformer = async ({ sourceFile, config }) => {
  if (config.tsx) {
    return sourceFile
  }
  return sourceFile
}
