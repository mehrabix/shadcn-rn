export function getPackageInfo(
  packageJson: Record<string, unknown>
): {
  name: string
  version: string
  description: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
} {
  return {
    name: (packageJson.name as string) || "unknown",
    version: (packageJson.version as string) || "0.0.0",
    description: (packageJson.description as string) || "",
    dependencies: (packageJson.dependencies as Record<string, string>) || {},
    devDependencies:
      (packageJson.devDependencies as Record<string, string>) || {},
  }
}

export function hasDependency(
  packageJson: Record<string, unknown>,
  dependencyName: string
): boolean {
  const deps = packageJson.dependencies as Record<string, string> | undefined
  const devDeps = packageJson.devDependencies as Record<string, string> | undefined

  return !!(deps?.[dependencyName] || devDeps?.[dependencyName])
}
