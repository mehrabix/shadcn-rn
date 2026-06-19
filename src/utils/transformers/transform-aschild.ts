import { type Transformer } from "./index"

export const transformAsChild: Transformer = async ({ sourceFile }) => {
  return sourceFile
}
