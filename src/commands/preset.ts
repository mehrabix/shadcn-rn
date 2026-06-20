import { existsSync } from "fs"
import path from "path"
import { decodePreset, type PresetConfig } from "../preset/preset"
import { log, info, error as logError } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { getConfig } from "../utils/get-config"
import { getProjectInfo } from "../utils/get-project-info"
import { Command } from "commander"

type PresetValues = Omit<PresetConfig, "chartColor"> & {
  chartColor: NonNullable<PresetConfig["chartColor"]>
}

type PresetDecodeResult = {
  code: string
  version: string
  values: PresetValues
  derived: string[]
}

function decodePresetCode(code: string): PresetDecodeResult {
  const decoded = decodePreset(code)

  if (!decoded) {
    throw new Error(`Invalid preset code: ${code}`)
  }

  const derived: string[] = []
  const chartColor = (decoded.chartColor ?? decoded.theme) as PresetValues["chartColor"]

  if (!decoded.chartColor) {
    derived.push("chartColor")
  }

  return {
    code,
    version: code[0],
    values: {
      ...decoded,
      chartColor,
    },
    derived,
  }
}

function printPresetInfo(result: PresetDecodeResult) {
  info(`Preset: ${highlighter.info(result.code)}`)
  log(`  Version: ${result.version}`)
  log(`  Style: ${result.values.style}`)
  log(`  Base Color: ${result.values.baseColor}`)
  log(`  Theme: ${result.values.theme}`)
  log(`  Font: ${result.values.font}`)
  log(`  Radius: ${result.values.radius}`)
  if (result.values.iconLibrary) {
    log(`  Icon Library: ${result.values.iconLibrary}`)
  }
  if (result.derived.length > 0) {
    info(`  Derived: ${result.derived.join(", ")}`)
  }
}

function handlePresetError(error: unknown) {
  if (error instanceof Error) {
    logError(error.message)
  }
  process.exit(1)
}

const decode = new Command()
  .name("decode")
  .description("decode a preset code")
  .argument("<code>", "the preset code to decode")
  .option("--json", "output as JSON.", false)
  .action((code, opts) => {
    try {
      const result = decodePresetCode(code)

      if (opts.json) {
        console.log(
          JSON.stringify(
            {
              code: result.code,
              version: result.version,
              values: result.values,
              derived: result.derived,
            },
            null,
            2
          )
        )
        return
      }

      printPresetInfo(result)
    } catch (error) {
      handlePresetError(error)
    }
  })

const resolve = new Command()
  .name("resolve")
  .alias("info")
  .description("resolve the current project's preset")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .action(async (opts) => {
    try {
      const cwd = path.resolve(opts.cwd)

      const config = await getConfig(cwd).catch(() => null)
      if (!config) {
        if (opts.json) {
          console.log(JSON.stringify(null, null, 2))
          return
        }
        log("No components.json found.")
        return
      }

      if (opts.json) {
        console.log(
          JSON.stringify(
            {
              style: config.style,
              baseColor: config.nativewind?.baseColor,
            },
            null,
            2
          )
        )
        return
      }

      info(`Style: ${highlighter.info(config.style)}`)
      info(`Base Color: ${highlighter.info(config.nativewind?.baseColor || "neutral")}`)
    } catch (err) {
      logError(`Failed to resolve preset: ${err}`)
      process.exit(1)
    }
  })

export const preset = new Command()
  .name("preset")
  .description("manage presets")
  .addCommand(decode)
  .addCommand(resolve)
  .action(() => {
    preset.outputHelp()
  })
