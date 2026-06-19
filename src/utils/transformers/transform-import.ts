import { type Transformer } from "./index"

export const transformImport: Transformer = async ({ sourceFile, config }) => {
  const aliases = config.aliases || {}

  for (const declaration of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = declaration.getModuleSpecifierValue()

    if (moduleSpecifier.startsWith("@/")) {
      const aliasKey = moduleSpecifier.replace("@/", "")
      const aliasPath = aliases[aliasKey as keyof typeof aliases]
      if (aliasPath && typeof aliasPath === "string") {
        declaration.setModuleSpecifier(
          moduleSpecifier.replace(`@/${aliasKey}`, aliasPath)
        )
      }
    }
  }

  return sourceFile
}
