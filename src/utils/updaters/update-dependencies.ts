export function updateDependencies(
  dependencies: string[],
  options: { packageManager: string; dev?: boolean }
): void {
  const { execSync } = require("child_process")

  if (dependencies.length === 0) return

  let installCmd = ""
  switch (options.packageManager) {
    case "yarn":
      installCmd = `yarn add ${dependencies.join(" ")}`
      break
    case "pnpm":
      installCmd = `pnpm add ${dependencies.join(" ")}`
      break
    case "bun":
      installCmd = `bun add ${dependencies.join(" ")}`
      break
    default:
      installCmd = `npm install ${dependencies.join(" ")}`
  }

  if (options.dev) {
    installCmd += " -D"
  }

  execSync(installCmd, { stdio: "inherit" })
}
