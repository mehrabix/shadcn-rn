#!/usr/bin/env node

import { Command } from "commander"
import { add } from "./commands/add"
import { init } from "./commands/init"
import { build } from "./commands/build"
import { apply } from "./commands/apply"
import { diff } from "./commands/diff"
import { docs } from "./commands/docs"
import { eject } from "./commands/eject"
import { infoCommand } from "./commands/info"
import { search } from "./commands/search"
import { view } from "./commands/view"
import { migrate } from "./commands/migrate"
import { preset } from "./commands/preset"
import { mcp } from "./commands/mcp"

const program = new Command()

program
  .name("shadcn-rn")
  .description("shadcn/ui for React Native")
  .version("0.1.0")

program.addCommand(init)
program.addCommand(add)
program.addCommand(build)
program.addCommand(apply)
program.addCommand(diff)
program.addCommand(docs)
program.addCommand(eject)
program.addCommand(infoCommand)
program.addCommand(search)
program.addCommand(view)
program.addCommand(migrate)
program.addCommand(preset)
program.addCommand(mcp)

program.parse()
