import { type Transformer } from "./transformers"

export const transformAsChild: Transformer = async ({ sourceFile, config }) => {
  return sourceFile
}
