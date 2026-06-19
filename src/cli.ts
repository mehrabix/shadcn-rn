#!/usr/bin/env node

import { Command } from "commander"
import { init } from "./commands/init"
import { add } from "./commands/add"
import { build } from "./commands/build"
import { apply } from "./commands/apply"
import { diff } from "./commands/diff"
import { docs } from "./commands/docs"
import { eject } from "./commands/eject"
import { infoCommand } from "./commands/info"
import { search } from "./commands/search"
import { view } from "./commands/view"
import { migrate } from "./commands/migrate"
import { handleError } from "./utils/handle-error"

const program = new Command()

program
  .name("shadcn-rn")
  .description("shadcn/ui for React Native")
  .version("0.1.0")

program
  .command("init")
  .description("Initialize shadcn-rn in your project")
  .option("--style <style>", "Style to use", "default")
  .option("--base-color <color>", "Base color to use", "neutral")
  .option("--force", "Force overwrite existing config")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await init(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("add <components...>")
  .description("Add components to your project")
  .option("--overwrite", "Overwrite existing files")
  .option("--yes", "Skip confirmation")
  .option("--dry-run", "Preview changes without writing")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (components, options) => {
    try {
      await add({ ...options, components })
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("build")
  .description("Build registry JSON files")
  .option("--output <dir>", "Output directory", "registry-output")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await build(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("apply")
  .description("Apply a preset to your project")
  .option("--preset <name>", "Preset to apply")
  .option("--only <types...>", "Only apply specific types")
  .option("--force", "Force apply")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await apply(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("diff")
  .description("Show differences between local and registry versions")
  .option("--component <name>", "Component to check")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await diff(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("docs")
  .description("Open documentation")
  .option("--component <name>", "Component to view docs for")
  .action(async (options) => {
    try {
      await docs(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("eject")
  .description("Inline CSS and remove shadcn-rn dependency")
  .option("--force", "Force eject")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await eject(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("info")
  .description("Display project information")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await infoCommand(options)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("search <query>")
  .description("Search for components")
  .option("--registries <names...>", "Registries to search")
  .action(async (query, options) => {
    try {
      await search({ query, ...options })
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("view <name>")
  .description("View component details")
  .option("--registry <name>", "Registry to search", "@shadcn-rn")
  .action(async (name, options) => {
    try {
      await view({ name, ...options })
    } catch (error) {
      handleError(error)
    }
  })

program
  .command("migrate")
  .description("Run migrations")
  .option("--type <name>", "Migration type")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await migrate(options)
    } catch (error) {
      handleError(error)
    }
  })

program.parse()
