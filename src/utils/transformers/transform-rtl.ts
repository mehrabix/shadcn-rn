import { type Transformer } from "./transformers"

export const transformRtl: Transformer = async ({ sourceFile, config }) => {
  if (!config.rtl) {
    return sourceFile
  }
  return sourceFile
}
