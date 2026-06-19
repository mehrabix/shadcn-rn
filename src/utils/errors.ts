export const ERROR_CODES = {
  MISSING_DIR_OR_EMPTY_PROJECT: "missing-dir-or-empty-project",
  EXISTING_CONFIG: "existing-config",
  TAILWIND_NOT_CONFIGURED: "tailwind-not-configured",
  TYPESCRIPT_NOT_CONFIGURED: "typescript-not-configured",
  COMPONENTS_DIR_MISSING: "components-dir-missing",
  NO_REGISTRY_ITEMS: "no-registry-items",
  INVALID_CONFIG: "invalid-config",
  CONFIG_MISSING: "config-missing",
  REGISTRY_FETCH_ERROR: "registry-fetch-error",
  REGISTRY_PARSE_ERROR: "registry-parse-error",
  REGISTRY_VALIDATION_ERROR: "registry-validation-error",
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
