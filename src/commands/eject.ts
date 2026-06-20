import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const ejectOptionsSchema = z.object({
  cwd: z.string(),
  force: z.boolean(),
  yes: z.boolean(),
})

export const eject = new Command()
  .name("eject")
  .description("remove shadcn-rn and inline all CSS variables")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--force", "skip confirmation.", false)
  .option("-y, --yes", "skip confirmation prompt.", false)
  .action(async (opts) => {
    try {
      const options = ejectOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      const config = await getConfig(options.cwd)

      if (!options.yes && !options.force) {
        const prompts = (await import("prompts")).default
        const { confirm } = await prompts({
          type: "confirm",
          name: "confirm",
          message: `This will ${highlighter.warning(
            "remove shadcn-rn"
          )} from your project and inline all CSS variables. Continue?`,
          initial: false,
        })

        if (!confirm) {
          warn("Eject cancelled.")
          process.exit(1)
        }
      }

      const cssPath = path.resolve(cwd, config.resolvedPaths.nativewindCss)
      let cssContent: string
      try {
        cssContent = await fs.readFile(cssPath, "utf-8")
      } catch {
        cssContent = ""
      }

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

      await fs.writeFile(cssPath, cssContent)
      success("Inlined CSS variables")

      const pkgPath = path.resolve(options.cwd, "package.json")
      try {
        const pkgContent = await fs.readFile(pkgPath, "utf-8")
        const pkg = JSON.parse(pkgContent)

        const deps = pkg.dependencies || {}
        const devDeps = pkg.devDependencies || {}
        const allDeps = { ...deps, ...devDeps }

        const shadcnDeps = Object.keys(allDeps).filter(
          (dep) => dep === "shadcn-rn" || dep.startsWith("@shadcn-rn/")
        )

        if (shadcnDeps.length > 0) {
          info(`Removing shadcn-rn dependencies: ${shadcnDeps.join(", ")}`)
          for (const dep of shadcnDeps) {
            delete deps[dep]
            delete devDeps[dep]
          }
          pkg.dependencies = deps
          pkg.devDependencies = devDeps
          await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))
        }
      } catch {
        warn("Could not update package.json")
      }

      const configPath = path.resolve(options.cwd, "components.json")
      try {
        await fs.unlink(configPath)
        info("Removed components.json")
      } catch {
        // Config doesn't exist
      }

      success("Ejected shadcn-rn successfully!")
      info("You can now remove shadcn-rn from your dependencies manually")
    } catch (err) {
      logError(`Failed to eject: ${err}`)
      process.exit(1)
    }
  })
