import { Command } from "commander"
import { add } from "./add"
import { validate } from "./validate"

export const registry = new Command()
  .name("registry")
  .description("manage registries")
  .addCommand(add)
  .addCommand(validate)
