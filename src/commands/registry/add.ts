import { log, info, success } from "../../utils/logger"

export interface RegistryAddOptions {
  name: string
  registry?: string
  overwrite?: boolean
  cwd: string
}

export async function registryAdd(options: RegistryAddOptions): Promise<void> {
  const { name, registry = "@shadcn-rn", cwd } = options

  log(`Adding ${name} from ${registry}...`)

  try {
    const { addComponents } = await import("../../utils/add-components")
    const { getConfig } = await import("../../utils/get-config")

    const config = await getConfig(cwd)
    await addComponents({
      config,
      components: [`${registry}/${name}`],
    })

    success(`Added ${name}`)
  } catch {
    info(`Failed to add ${name}`)
  }
}
