import * as fs from "fs/promises"
import * as path from "path"

export async function updateAppIndex(
  cwd: string,
  componentPath: string
): Promise<void> {
  const indexPath = path.join(cwd, "App.tsx")

  try {
    const content = await fs.readFile(indexPath, "utf-8")

    const componentName = path.basename(
      componentPath,
      path.extname(componentPath)
    )

    if (content.includes(componentName)) {
      return
    }

    const importLine = `import { ${componentName} } from '${componentPath}'`
    const newContent = `${importLine}\n${content}`

    await fs.writeFile(indexPath, newContent)
  } catch {
    // File doesn't exist or can't be read, skip
  }
}
