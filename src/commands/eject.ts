import * as fs from "fs/promises"
import * as path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, success, error } from "../utils/logger"

export interface EjectOptions {
  cwd: string
  force?: boolean
}

export async function eject(options: EjectOptions): Promise<void> {
  const { cwd, force = false } = options

  log("Ejecting shadcn-rn...")

  const config = await getConfig(cwd)

  info("Inlining tailwind.css...")
  const cssPath = path.resolve(cwd, config.resolvedPaths.nativewindCss)
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;`

  await fs.writeFile(cssPath, cssContent)

  success("Ejected shadcn-rn successfully!")
  info("You can now remove shadcn-rn from your dependencies")
}
