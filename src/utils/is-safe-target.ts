export function isSafeTarget(targetPath: string, cwd: string): boolean {
  const normalizedTarget = targetPath.replace(/\\/g, "/")
  const normalizedCwd = cwd.replace(/\\/g, "/")

  if (normalizedTarget.includes("..")) {
    return false
  }

  if (!normalizedTarget.startsWith(normalizedCwd)) {
    return false
  }

  return true
}
