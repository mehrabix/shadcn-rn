import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
    "registry/index": "src/registry/index.ts",
    "registry/schema": "src/registry/schema.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  external: [
    "react",
    "react-native",
    "nativewind",
    "tailwindcss",
    "commander",
    "cosmiconfig",
    "zod",
  ],
  splitting: false,
  sourcemap: true,
  minify: false,
})
