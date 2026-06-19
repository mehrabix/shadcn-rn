import * as fs from "fs/promises"
import * as path from "path"
import { readRegistryWithIncludes } from "../registry/loader"
import { log, info, success, error } from "../utils/logger"

export interface BuildOptions {
  cwd: string
  output?: string
}

export async function build(options: BuildOptions): Promise<void> {
  const { cwd, output = "registry-output" } = options

  log("Building registry...")

  const registryPath = path.join(cwd, "registry.json")

  try {
    await fs.access(registryPath)
  } catch {
    error("registry.json not found in project root")
    return
  }

  const registry = await readRegistryWithIncludes(registryPath)

  const outputDir = path.join(cwd, output)
  await fs.mkdir(outputDir, { recursive: true })

  const indexItems = registry.items.map((item) => ({
    name: item.name,
    type: item.type,
    description: item.description,
  }))

  await fs.writeFile(
    path.join(outputDir, "index.json"),
    JSON.stringify(indexItems, null, 2)
  )

  for (const item of registry.items) {
    const itemPath = path.join(outputDir, `${item.name}.json`)
    await fs.writeFile(itemPath, JSON.stringify(item, null, 2))
  }

  success(`Built ${registry.items.length} items to ${output}/`)
}
