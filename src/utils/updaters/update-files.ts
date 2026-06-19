import * as fs from "fs/promises"
import * as path from "path"
import type { Config } from "../../registry/schema"
import { transform } from "../transformers"
import type { TransformOpts } from "../transformers"

export interface UpdateFilesOptions {
  cwd: string
  overwrite?: boolean
  config?: Config
}

export async function updateFiles(
  files: Array<{ path: string; content: string; target?: string }>,
  options: UpdateFilesOptions
): Promise<void> {
  for (const file of files) {
    const targetPath = file.target
      ? path.resolve(options.cwd, file.target)
      : path.resolve(options.cwd, file.path)

    if (!options.overwrite) {
      try {
        await fs.access(targetPath)
        continue
      } catch {
        // File doesn't exist, proceed
      }
    }

    const dir = path.dirname(targetPath)
    await fs.mkdir(dir, { recursive: true })

    let content = file.content

    if (options.config) {
      try {
        const transformOpts: TransformOpts = {
          filename: file.target || file.path,
          raw: file.content,
          config: options.config,
          transformJsx: false,
        }
        content = await transform(transformOpts)
      } catch {
        // If transform fails, use original content
        content = file.content
      }
    }

    await fs.writeFile(targetPath, content)
  }
}
