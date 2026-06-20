import type { Transformer } from "./index"
import { convertWebComponentToRN } from "../../converters/web-to-rn"

export const transformReactNative: Transformer = async ({
  sourceFile,
  config,
}) => {
  const sourceCode = sourceFile.getText()

  const result = convertWebComponentToRN(sourceCode, config)

  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.warn(`[shadcn-rn] ${warning}`)
    }
  }

  sourceFile.replaceWithText(result.code)
  return sourceFile
}
