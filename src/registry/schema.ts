import { z } from "zod"

export const registryConfigItemSchema = z.union([
  z.string().refine((s) => s.includes("{name}"), {
    message: "Registry URL must include {name} placeholder",
  }),
  z.object({
    url: z.string().refine((s) => s.includes("{name}"), {
      message: "Registry URL must include {name} placeholder",
    }),
    params: z.record(z.string(), z.string()).optional(),
    headers: z.record(z.string(), z.string()).optional(),
  }),
])

export const registryConfigSchema = z.record(
  z.string().refine((key) => key.startsWith("@"), {
    message: "Registry names must start with @ (e.g., @shadcn-rn)",
  }),
  registryConfigItemSchema
)

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    style: z.string().default("default"),
    tsx: z.coerce.boolean().default(true),
    rsc: z.coerce.boolean().default(false),
    nativewind: z
      .object({
        config: z.string().optional(),
        css: z.string().optional(),
        baseColor: z.string().default("neutral"),
        cssVariables: z.boolean().default(true),
        prefix: z.string().default("").optional(),
      })
      .default({}),
    aliases: z
      .object({
        components: z.string().default("@/components"),
        utils: z.string().default("@/lib/utils"),
        ui: z.string().optional(),
        lib: z.string().optional(),
        hooks: z.string().optional(),
      })
      .default({}),
    iconLibrary: z.string().optional(),
    rtl: z.coerce.boolean().default(false).optional(),
    menuColor: z
      .enum([
        "default",
        "inverted",
        "default-translucent",
        "inverted-translucent",
      ])
      .default("default")
      .optional(),
    menuAccent: z.enum(["subtle", "bold"]).default("subtle").optional(),
    registries: registryConfigSchema.optional(),
  })
  .strict()

export type RawConfig = z.infer<typeof rawConfigSchema>

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    nativewindConfig: z.string(),
    nativewindCss: z.string(),
    utils: z.string(),
    components: z.string(),
    lib: z.string(),
    hooks: z.string(),
    ui: z.string(),
  }),
})

export type Config = z.infer<typeof configSchema>

export type RegistryConfig = {
  registries: z.infer<typeof registryConfigSchema>
}

export const registryItemTypeSchema = z.enum([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:page",
  "registry:file",
  "registry:theme",
  "registry:style",
  "registry:item",
  "registry:base",
  "registry:font",
  "registry:example",
  "registry:internal",
])

export const registryItemFileSchema = z.discriminatedUnion("type", [
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: z.enum(["registry:file", "registry:page"]),
    target: z.string(),
  }),
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: registryItemTypeSchema.exclude(["registry:file", "registry:page"]),
    target: z.string().optional(),
  }),
])

export type RegistryItemFile = z.infer<typeof registryItemFileSchema>

export const registryItemTailwindSchema = z.object({
  config: z
    .object({
      content: z.array(z.string()).optional(),
      theme: z.record(z.string(), z.any()).optional(),
      plugins: z.array(z.string()).optional(),
    })
    .optional(),
})

export const registryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

const cssValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.array(z.union([z.string(), z.record(z.string(), z.string())])),
    z.record(z.string(), cssValueSchema),
  ])
)

export const registryItemCssSchema = z.record(z.string(), cssValueSchema)

export const registryItemEnvVarsSchema = z.record(z.string(), z.string())

export const registryItemFontSchema = z.object({
  family: z.string(),
  provider: z.literal("google"),
  import: z.string(),
  variable: z.string(),
  weight: z.array(z.string()).optional(),
  subsets: z.array(z.string()).optional(),
  selector: z.string().optional(),
  dependency: z.string().optional(),
})

export const registryItemCommonSchema = z.object({
  $schema: z.string().optional(),
  extends: z.string().optional(),
  name: z.string(),
  title: z.string().optional(),
  author: z.string().min(2).optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  tailwind: registryItemTailwindSchema.optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  css: registryItemCssSchema.optional(),
  envVars: registryItemEnvVarsSchema.optional(),
  meta: z.record(z.string(), z.any()).optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
})

export const registryItemSchema = z.discriminatedUnion("type", [
  registryItemCommonSchema.extend({
    type: z.literal("registry:base"),
    config: rawConfigSchema.deepPartial().optional(),
  }),
  registryItemCommonSchema.extend({
    type: z.literal("registry:font"),
    font: registryItemFontSchema,
  }),
  registryItemCommonSchema.extend({
    type: registryItemTypeSchema.exclude(["registry:base", "registry:font"]),
  }),
])

export type RegistryItem = z.infer<typeof registryItemSchema>
export type RegistryBaseItem = Extract<RegistryItem, { type: "registry:base" }>

const registryBaseSchema = z
  .object({
    $schema: z.string().optional(),
    name: z.string().optional(),
    homepage: z.string().optional(),
    include: z.array(z.string()).optional(),
    items: z.array(registryItemSchema).optional(),
  })
  .refine(
    (registry) =>
      registry.items !== undefined || registry.include !== undefined,
    {
      message: "Registry must define at least one of `items` or `include`.",
      path: ["items"],
    }
  )

export const registryChunkSchema = registryBaseSchema.transform((registry) => ({
  ...registry,
  items: registry.items ?? [],
}))

export const registrySchema = registryChunkSchema.pipe(
  z.object({
    $schema: z.string().optional(),
    name: z.string(),
    homepage: z.string(),
    include: z.array(z.string()).optional(),
    items: z.array(registryItemSchema),
  })
)

export type Registry = z.infer<typeof registrySchema>

export const registryIndexSchema = z.array(registryItemSchema)

export const stylesSchema = z.array(
  z.object({
    name: z.string(),
    label: z.string(),
  })
)

export const registryBaseColorSchema = z.object({
  inlineColors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  cssVars: registryItemCssVarsSchema,
  cssVarsV4: registryItemCssVarsSchema.optional(),
  inlineColorsTemplate: z.string(),
  cssVarsTemplate: z.string(),
})

export const registryResolvedItemsTreeSchema = registryItemCommonSchema
  .pick({
    dependencies: true,
    devDependencies: true,
    files: true,
    tailwind: true,
    cssVars: true,
    css: true,
    envVars: true,
    docs: true,
  })
  .extend({
    fonts: z
      .array(
        registryItemCommonSchema.extend({
          type: z.literal("registry:font"),
          font: registryItemFontSchema,
        })
      )
      .optional(),
  })

export type ResolvedItemsTree = z.infer<typeof registryResolvedItemsTreeSchema>

export const searchResultItemSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  registry: z.string(),
  addCommandArgument: z.string(),
})

export type SearchResultItem = z.infer<typeof searchResultItemSchema>

export const searchResultsSchema = z.object({
  pagination: z.object({
    total: z.number(),
    offset: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  }),
  items: z.array(searchResultItemSchema),
  errors: z.array(
    z.object({
      registry: z.string(),
      message: z.string(),
    })
  ).optional(),
})

export const iconsSchema = z.record(
  z.string(),
  z.record(z.string(), z.string())
)

export const registriesIndexSchema = z.record(
  z.string().regex(/^@[a-zA-Z0-9][a-zA-Z0-9-_]*$/),
  z.string()
)

export const registriesSchema = z.array(
  z.object({
    name: z.string(),
    homepage: z.string().optional(),
    url: z.string(),
    description: z.string().optional(),
  })
)

export const presetSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  base: z.string(),
  style: z.string(),
  baseColor: z.string(),
  theme: z.string(),
  iconLibrary: z.string(),
  font: z.string(),
  rtl: z.coerce.boolean().default(false),
  menuAccent: z.enum(["subtle", "bold"]),
  menuColor: z.enum([
    "default",
    "inverted",
    "default-translucent",
    "inverted-translucent",
  ]),
  radius: z.string(),
})

export type Preset = z.infer<typeof presetSchema>

export const configJsonSchema = z.object({
  presets: z.array(presetSchema),
})

export type ConfigJson = z.infer<typeof configJsonSchema>

export const workspaceConfigSchema = z.object({
  components: configSchema.nullable().optional(),
  ui: configSchema.nullable().optional(),
  lib: configSchema.nullable().optional(),
  hooks: configSchema.nullable().optional(),
})

export type WorkspaceConfig = z.infer<typeof workspaceConfigSchema>
