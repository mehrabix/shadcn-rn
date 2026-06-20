import path from "path"
import { getConfig } from "../utils/get-config"
import { log, info, error as logError, warn } from "../utils/logger"
import { highlighter } from "../utils/highlighter"
import { Command } from "commander"

const WEDNEST_URL = "https://wednest.dev"

export const docs = new Command()
  .name("docs")
  .description("get docs, api references and usage examples for components")
  .argument("[components...]", "component names")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .action(async (components, opts) => {
    try {
      const cwd = path.resolve(opts.cwd)
      const config = await getConfig(cwd).catch(() => null)

      if (components && components.length > 0) {
        if (opts.json) {
          console.log(
            JSON.stringify(
              {
                components: components.map((name: string) => ({
                  name,
                  links: getComponentLinks(name),
                })),
              },
              null,
              2
            )
          )
          return
        }

        for (const component of components) {
          const links = getComponentLinks(component)
          log(highlighter.info(component))
          for (const [key, value] of Object.entries(links)) {
            log(`  - ${key.padEnd(12)}${value}`)
          }
          info("")
        }
        return
      }

      const baseUrl = `${WEDNEST_URL}/docs`

      if (opts.json) {
        console.log(
          JSON.stringify({ url: baseUrl, style: config?.style ?? null }, null, 2)
        )
        return
      }

      info(`Documentation: ${highlighter.info(baseUrl)}`)
      info("")
      info("Usage:")
      info(
        `  ${highlighter.success("npx shadcn-rn docs button")}  - View docs for a specific component`
      )
      info("")
      info("Available component docs:")
      for (const name of COMPONENT_LINKS) {
        log(`  ${name}`)
      }
    } catch (err) {
      logError(`Failed to get docs: ${err}`)
      process.exit(1)
    }
  })

const COMPONENT_LINKS = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "data-table",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "input-otp",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "skeleton",
  "slider",
  "sonner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
]

function getComponentLinks(component: string): Record<string, string> {
  return {
    docs: `${WEDNEST_URL}/docs/components/${component}`,
    source: `${WEDNEST_URL}/docs/components/${component}#source`,
  }
}
