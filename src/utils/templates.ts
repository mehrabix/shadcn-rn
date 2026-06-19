import * as fs from "fs/promises"
import * as path from "path"

export interface TemplateConfig {
  name: string
  title: string
  description: string
  framework: string
  files: Record<string, string>
}

export const expoTemplate: TemplateConfig = {
  name: "expo",
  title: "Expo",
  description: "Expo project with NativeWind",
  framework: "expo",
  files: {
    "nativewind.config.js": `/** @type {import('nativewind').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    "global.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,
  },
}

export function getTemplate(name: string): TemplateConfig | null {
  const templates: Record<string, TemplateConfig> = {
    expo: expoTemplate,
  }
  return templates[name] || null
}

export async function scaffoldTemplate(
  cwd: string,
  template: TemplateConfig
): Promise<void> {
  for (const [filePath, content] of Object.entries(template.files)) {
    const fullPath = path.join(cwd, filePath)
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, content)
  }
}
