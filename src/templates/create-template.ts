import os from "os"
import path from "path"
import type { Config } from "../utils/get-config"
import { spinner } from "../utils/spinner"
import { logger } from "../utils/logger"

export interface TemplateOptions {
  projectPath: string
  packageManager: string
  cwd: string
}

export interface TemplateInitOptions {
  projectPath: string
  components: string[]
  registryBaseConfig?: Record<string, unknown>
  silent: boolean
}

export interface TemplateConfig {
  name: string
  title: string
  description?: string
  defaultProjectName: string
  templateDir: string
  frameworks?: string[]
  scaffold?: (options: TemplateOptions) => Promise<void>
  create: (options: TemplateOptions) => Promise<void>
  init?: (options: TemplateInitOptions) => Promise<Config>
  postInit?: (options: { projectPath: string }) => Promise<void>
}

export function createTemplate(config: TemplateConfig) {
  return {
    ...config,
    frameworks: config.frameworks ?? [],
    scaffold:
      config.scaffold ??
      defaultScaffold({
        title: config.title,
        templateDir: config.templateDir,
      }),
    postInit: config.postInit ?? defaultPostInit,
  }
}

export function resolveTemplate(
  template: ReturnType<typeof createTemplate>,
  _options: { monorepo?: boolean }
) {
  return template
}

function getInstallArgs(packageManager: string): string[] {
  switch (packageManager) {
    case "pnpm":
      return ["--no-frozen-lockfile"]
    case "yarn":
      return ["--no-immutable"]
    default:
      return []
  }
}

function defaultScaffold({
  title,
  templateDir,
}: {
  title: string
  templateDir: string
}) {
  return async ({ projectPath, packageManager }: TemplateOptions) => {
    const createSpinner = spinner(
      `Creating a new ${title} project. This may take a few minutes.`
    )?.start()

    try {
      const localTemplateDir = process.env.SHADCN_TEMPLATE_DIR
      if (localTemplateDir) {
        const { copySync } = await import("fs-extra")
        const localTemplatePath = path.resolve(localTemplateDir, templateDir)
        copySync(localTemplatePath, projectPath, {
          filter: (src: string) => !src.includes("node_modules"),
        })
      } else {
        const { execa } = await import("execa")
        const gatsbyRepoUrl =
          process.env.SHADCN_GITHUB_URL ??
          "https://github.com/mehrabix/shadcn-rn.git"
        const templatePath = path.join(
          os.tmpdir(),
          `shadcn-rn-template-${Date.now()}`
        )
        await execa("git", [
          "clone",
          "--depth",
          "1",
          "--filter=blob:none",
          "--sparse",
          gatsbyRepoUrl,
          templatePath,
        ])
        await execa("git", [
          "-C",
          templatePath,
          "sparse-checkout",
          "set",
          `templates/${templateDir}`,
        ])

        const extractedPath = path.resolve(
          templatePath,
          "templates",
          templateDir
        )
        const { moveSync, removeSync } = await import("fs-extra")
        moveSync(extractedPath, projectPath)
        removeSync(templatePath)
      }

      const { execa } = await import("execa")
      const installArgs = getInstallArgs(packageManager)
      const args = ["install", ...installArgs]
      await execa(packageManager, args, {
        cwd: projectPath,
      })

      const { readFileSync, writeFileSync, existsSync } = await import("fs")
      const packageJsonPath = path.join(projectPath, "package.json")
      if (existsSync(packageJsonPath)) {
        const packageJsonContent = readFileSync(packageJsonPath, "utf-8")
        const packageJson = JSON.parse(packageJsonContent)
        packageJson.name = path.basename(projectPath)
        writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2) + "\n"
        )
      }

      createSpinner?.succeed(`Creating a new ${title} project.`)
    } catch (error) {
      createSpinner?.fail(
        `Something went wrong creating a new ${title} project.`
      )
      throw error
    }
  }
}

async function defaultPostInit({ projectPath }: { projectPath: string }) {
  try {
    const { execa } = await import("execa")
    await execa("git", ["init"], { cwd: projectPath })
    await execa("git", ["add", "-A"], { cwd: projectPath })
    await execa("git", ["commit", "-m", "feat: initial commit"], {
      cwd: projectPath,
    })
  } catch {
    // Silently ignore git failures
  }
}
