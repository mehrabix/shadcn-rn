import * as fs from "fs/promises"
import * as path from "path"
import { highlighter } from "./highlighter"
import { logger } from "./logger"

export interface CreateProjectOptions {
  cwd: string
  projectName?: string
  template?: string
}

export async function createProject(
  options: CreateProjectOptions
): Promise<void> {
  const { cwd, projectName = "my-app" } = options

  const projectDir = path.join(cwd, projectName)

  try {
    await fs.access(projectDir)
    logger.error(`Directory ${projectName} already exists`)
    return
  } catch {
    // Directory doesn't exist, proceed
  }

  await fs.mkdir(projectDir, { recursive: true })

  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    main: "expo-router/entry",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
    },
    dependencies: {
      expo: "~50.0.0",
      "expo-router": "~3.0.0",
      "nativewind": "^2.0.0",
      react: "18.2.0",
      "react-native": "0.73.0",
    },
    devDependencies: {
      "@types/react": "~18.2.0",
      tailwindcss: "^3.4.0",
      typescript: "^5.0.0",
    },
  }

  await fs.writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  )

  logger.success(`Created project ${highlighter.info(projectName)}`)
}
