import { expo } from "./expo"

export { createTemplate, resolveTemplate } from "./create-template"
export type { TemplateInitOptions, TemplateOptions, TemplateConfig } from "./create-template"

export const templates = {
  expo,
}

export function getTemplateForFramework(frameworkName?: string) {
  if (!frameworkName) {
    return undefined
  }

  for (const [key, template] of Object.entries(templates)) {
    if (template.frameworks.includes(frameworkName)) {
      return key
    }
  }

  return undefined
}
