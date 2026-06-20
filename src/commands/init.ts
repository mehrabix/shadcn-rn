import path from "path"
import { preflightInit } from "../preflights"
import { getConfig, createConfig } from "../utils/get-config"
import { getProjectInfo } from "../utils/get-project-info"
import { addComponents } from "../utils/add-components"
import { log, info, success, error as logError, warn } from "../utils/logger"
import { spinner } from "../utils/spinner"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"
import { z } from "zod"

export const initOptionsSchema = z.object({
  cwd: z.string(),
  style: z.string().optional(),
  baseColor: z.string().optional(),
  force: z.boolean(),
  yes: z.boolean(),
  silent: z.boolean(),
  cssVariables: z.boolean().default(true),
})

export const init = new Command()
  .name("init")
  .description("initialize shadcn-rn in your project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--style <style>", "the style to use", "default")
  .option("--base-color <color>", "the base color to use", "neutral")
  .option("--force", "force overwrite existing config.", false)
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-s, --silent", "mute output.", false)
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse({
        ...opts,
        cwd: path.resolve(opts.cwd),
      })

      const initSpinner = spinner("Initializing shadcn-rn...", {
        silent: options.silent,
      }).start()

      const projectInfo = await getProjectInfo(options.cwd)
      initSpinner.stop()

      info(`Detected framework: ${highlighter.info(projectInfo.framework.label)}`)
      info(`Package manager: ${highlighter.info(projectInfo.packageManager)}`)

      if (!projectInfo.hasNativeWind) {
        warn("NativeWind not detected. Installing...")
        const installSpinner = spinner("Installing NativeWind...", {
          silent: options.silent,
        }).start()

        await installNativeWind(projectInfo.packageManager)
        installSpinner.succeed("NativeWind installed")
      }

      if (!projectInfo.hasTypeScript) {
        info("TypeScript not detected. Some features may be limited.")
      }

      let config = await getConfig(options.cwd).catch(() => null)

      if (config && !options.force) {
        warn(
          `Config already exists at ${highlighter.info(
            options.cwd
          )}. Use --force to overwrite.`
        )
        return
      }

      const { passed, errors } = await preflightInit(options.cwd)

      if (errors["MISSING_DIR_OR_EMPTY_PROJECT"]) {
        logError(
          `No package.json found at ${highlighter.info(options.cwd)}.\n` +
            `Are you in the right directory?`
        )
        process.exit(1)
      }

      if (errors["MISSING_CONFIG"] === undefined || options.force) {
        config = await createConfig(options.cwd, {
          style: options.style,
          baseColor: options.baseColor,
        })
        success("Created components.json")
      }

      if (!config) {
        config = await getConfig(options.cwd)
      }

      const addSpinner = spinner("Adding starter component...", {
        silent: options.silent,
      }).start()

      await addComponents(["button"], config, {
        overwrite: true,
        silent: true,
      })

      addSpinner.stop()
      success("Initialized shadcn-rn!")
      info("")
      info(`You can now add components with: ${highlighter.success(
        "npx shadcn-rn add <component>"
      )}`)
    } catch (err) {
      logError(`Failed to initialize: ${err}`)
      process.exit(1)
    }
  })

async function installNativeWind(packageManager: string): Promise<void> {
  const { execSync } = await import("child_process")

  const installCmd =
    packageManager === "npm"
      ? "npm install nativewind react-native-reanimated react-native-safe-area-context"
      : packageManager === "yarn"
      ? "yarn add nativewind react-native-reanimated react-native-safe-area-context"
      : packageManager === "pnpm"
      ? "pnpm add nativewind react-native-reanimated react-native-safe-area-context"
      : "bun add nativewind react-native-reanimated react-native-safe-area-context"

  execSync(installCmd, { stdio: "ignore" })

  const devCmd =
    packageManager === "npm"
      ? "npm install --dev tailwindcss@^3.4.17"
      : packageManager === "yarn"
      ? "yarn add --dev tailwindcss@^3.4.17"
      : packageManager === "pnpm"
      ? "pnpm add --dev tailwindcss@^3.4.17"
      : "bun add --dev tailwindcss@^3.4.17"

  execSync(devCmd, { stdio: "ignore" })
}
