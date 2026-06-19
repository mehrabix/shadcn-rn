import { type Transformer } from "./index"

export const transformCssVars: Transformer = async ({ sourceFile }) => {
  return sourceFile
}
