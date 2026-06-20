import { promises as fs } from "fs"
import path from "path"
import { getConfig } from "../utils/get-config"
import { getPackageManager } from "../utils/get-package-manager"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { spinner } from "../utils/spinner"
import { Command } from "commander"
import { execa } from "execa"
import fsExtra from "fs-extra"
import { z } from "zod"

export const ejectOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
  silent: z.boolean(),
})

export const eject = new Command()
  .name("eject")
  .description("remove shadcn-rn and inline all CSS variables")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-s, --silent", "mute output.", false)
  .action(async (opts) => {
    try {
      const options = ejectOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        yes: opts.yes,
        silent: opts.silent,
      })

      await runEject(options)
    } catch (err) {
      logError(`Failed to eject: ${err}`)
      process.exit(1)
    }
  })

export async function runEject(options: z.infer<typeof ejectOptionsSchema>) {
  if (!fsExtra.existsSync(path.resolve(options.cwd, "components.json"))) {
    logError(
      `No ${highlighter.info("components.json")} found. Run ${highlighter.info("init")} first.`
    )
    process.exit(1)
  }

  const config = await getConfig(options.cwd)
  if (!config) {
    logError("Could not load config.")
    process.exit(1)
  }

  const cssFilepath = config.resolvedPaths.nativewindCss
  if (!cssFilepath) {
    logError("Could not resolve the NativeWind CSS file from components.json.")
    process.exit(1)
  }

  const cssFilepathRelative = path.relative(options.cwd, cssFilepath)

  if (!options.silent) {
    warn(
      "This action is not reversible. Future shadcn-rn CLI updates to CSS variables will not apply automatically."
    )
    info("")
    log("This will:")
    log(
      `  - Inline shadcn-rn CSS variables into ${highlighter.info(cssFilepathRelative)}`
    )
    log(`  - Remove the ${highlighter.info("shadcn-rn")} dependency`)
    info("")
  }

  if (!options.yes) {
    const prompts = (await import("prompts")).default
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: "Proceed?",
      initial: false,
    })

    if (!proceed) {
      process.exit(0)
    }
  }

  const ejectSpinner = spinner(
    `Inlining CSS variables into ${highlighter.info(cssFilepathRelative)}.`,
    { silent: options.silent }
  )?.start()

  let cssContent = ""
  try {
    cssContent = await fs.readFile(cssFilepath, "utf-8")
  } catch {}

  const { resolveRegistryTree } = await import("../registry/resolver")
  const tree = await resolveRegistryTree([], { config })

  if (tree.cssVars) {
    for (const [selector, vars] of Object.entries(tree.cssVars)) {
      const selectorName = selector === "light" ? ":root" : `.${selector}`
      const declarations = Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n")
      const block = `${selectorName} {\n${declarations}\n}`

      if (!cssContent.includes(selectorName)) {
        cssContent += `\n\n${block}`
      }
    }
  }

  await fs.writeFile(cssFilepath, cssContent)
  ejectSpinner?.succeed()

  if (hasShadcnDependency(options.cwd)) {
    const removeSpinner = spinner(
      `Removing ${highlighter.info("shadcn-rn")} dependency.`,
      { silent: options.silent }
    )?.start()

    await removeShadcnDependency(options.cwd)
    removeSpinner?.succeed()
  } else if (!options.silent) {
    warn(
      `The ${highlighter.info("shadcn-rn")} package was not found in package.json. Skipped removal.`
    )
  }

  info("")
  success(
    `Ejected ${highlighter.info("shadcn-rn")} successfully. CSS variables inlined into ${highlighter.info(cssFilepathRelative)}.`
  )
  info("")
}

function hasShadcnDependency(cwd: string): boolean {
  try {
    const pkgJson = fsExtra.readJsonSync(path.join(cwd, "package.json"))
    return Boolean(
      pkgJson.dependencies?.["shadcn-rn"] ||
        pkgJson.devDependencies?.["shadcn-rn"]
    )
  } catch {
    return false
  }
}

async function removeShadcnDependency(cwd: string) {
  const packageManager = await getPackageManager(cwd)

  switch (packageManager) {
    case "npm":
      await execa("npm", ["uninstall", "shadcn-rn"], { cwd })
      break
    case "pnpm":
      await execa("pnpm", ["remove", "shadcn-rn"], { cwd })
      break
    case "yarn":
      await execa("yarn", ["remove", "shadcn-rn"], { cwd })
      break
    case "bun":
      await execa("bun", ["remove", "shadcn-rn"], { cwd })
      break
  }
}
