import path from "path"
import { configWithDefaults } from "../registry/config"
import { addComponents } from "../utils/add-components"
import { ensureRegistriesInConfig } from "../utils/registries"
import { rawConfigSchema } from "../registry/schema"
import { resolveConfigPaths } from "../utils/get-config"
import { updateDependencies } from "../utils/updaters/update-dependencies"
import { updateCssVars } from "../utils/updaters/update-css-vars"
import { updateTailwindConfig } from "../utils/updaters/update-tailwind-config"
import { updateFonts } from "../utils/updaters/update-fonts"
import { logger } from "../utils/logger"
import deepmerge from "deepmerge"
import fs from "fs-extra"

import { createTemplate } from "./create-template"
import type { TemplateInitOptions } from "./create-template"

export const expo = createTemplate({
  name: "expo",
  title: "Expo",
  description: "Expo project with NativeWind",
  defaultProjectName: "my-app",
  templateDir: "expo",
  frameworks: ["expo", "react-native"],
  create: async ({ projectPath, packageManager }) => {
    const { execa } = await import("execa")

    await execa(
      packageManager === "npm" ? "npx" : packageManager,
      [
        packageManager === "npm"
          ? "create-expo-app@latest"
          : "create-expo-app",
        projectPath,
        "--template",
        "blank-typescript",
      ],
      { stdio: "inherit" }
    )
  },
  init: async (options: TemplateInitOptions) => {
    const { projectPath, components, silent, registryBaseConfig } = options

    const configPath = path.resolve(projectPath, "components.json")
    let config = await fs.readJson(configPath).catch(() => null)

    if (registryBaseConfig) {
      config = deepmerge(config || {}, registryBaseConfig)
    }

    if (!config) {
      config = {
        style: "default",
        tsx: true,
        nativewind: {
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      }
    }

    await fs.writeJson(configPath, config, { spaces: 2 })

    const resolvedConfig = await resolveConfigPaths(projectPath, config)
    const { config: configWithRegistries } = await ensureRegistriesInConfig(
      components,
      resolvedConfig,
      { silent }
    )

    await addComponents(components, configWithRegistries, {
      overwrite: true,
      silent,
      isNewProject: true,
    })

    return configWithRegistries
  },
})
