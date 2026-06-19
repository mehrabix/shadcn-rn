import * as path from "path"

export function getRegistryItemPath(
  name: string,
  options: { cwd: string; registry?: string }
): string {
  const { cwd, registry = "@shadcn-rn" } = options
  return path.join(cwd, "registry", registry, `${name}.json`)
}

export function getRegistryIndexPath(
  options: { cwd: string; registry?: string }
): string {
  const { cwd, registry = "@shadcn-rn" } = options
  return path.join(cwd, "registry", registry, "index.json")
}
