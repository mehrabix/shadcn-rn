export function updateFiles(
  files: Array<{ path: string; content: string; target?: string }>,
  options: { cwd: string; overwrite?: boolean }
): Promise<void> {
  const fs = require("fs/promises")
  const path = require("path")

  return Promise.all(
    files.map(async (file) => {
      const targetPath = file.target
        ? path.resolve(options.cwd, file.target)
        : path.resolve(options.cwd, file.path)

      if (!options.overwrite) {
        try {
          await fs.access(targetPath)
          return
        } catch {
          // File doesn't exist, proceed
        }
      }

      const dir = path.dirname(targetPath)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(targetPath, file.content)
    })
  ).then()
}
