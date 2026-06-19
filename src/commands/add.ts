import { getConfig } from "../utils/get-config"
import { addComponents } from "../utils/add-components"
import { log, info, success, error } from "../utils/logger"

export interface AddOptions {
  components: string[]
  cwd: string
  overwrite?: boolean
  yes?: boolean
  dryRun?: boolean
  silent?: boolean
}

export async function add(options: AddOptions): Promise<void> {
  const { components, cwd, overwrite = false, yes = false, dryRun = false, silent = false } = options

  if (components.length === 0) {
    error("No components specified. Usage: npx shadcn-rn add <component> [...]")
    return
  }

  log(`Adding components: ${components.join(", ")}`)

  const config = await getConfig(cwd)

  if (dryRun) {
    info("Dry run mode - no files will be written")
    const { resolveRegistryTree } = await import("../registry/resolver")
    const tree = await resolveRegistryTree(components, { config })

    info("Files that would be added:")
    for (const file of tree.files || []) {
      log(`  ${file.path}`)
    }

    if (tree.dependencies && tree.dependencies.length > 0) {
      info("Dependencies that would be installed:")
      for (const dep of tree.dependencies) {
        log(`  ${dep}`)
      }
    }
    return
  }

  await addComponents({
    config,
    components,
    overwrite,
    silent,
  })

  success(`Added ${components.length} component(s)`)
}
