import { type Transformer } from "./transformers"

export const transformTwPrefixes: Transformer = async ({
  sourceFile,
  config,
}) => {
  if (!config.tailwind?.prefix) {
    return sourceFile
  }
  return sourceFile
}
