export enum RegistryErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  FETCH_ERROR = "FETCH_ERROR",
  NOT_CONFIGURED = "NOT_CONFIGURED",
  LOCAL_FILE_ERROR = "LOCAL_FILE_ERROR",
  PARSE_ERROR = "PARSE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  MISSING_ENV_VARS = "MISSING_ENV_VARS",
  CONFIG_MISSING = "CONFIG_MISSING",
  CONFIG_PARSE_ERROR = "CONFIG_PARSE_ERROR",
}

export class RegistryError extends Error {
  code: RegistryErrorCode
  statusCode?: number
  context?: Record<string, unknown>
  suggestion?: string

  constructor(
    message: string,
    code: RegistryErrorCode,
    options?: {
      statusCode?: number
      context?: Record<string, unknown>
      suggestion?: string
      cause?: unknown
    }
  ) {
    super(message, { cause: options?.cause })
    this.name = "RegistryError"
    this.code = code
    this.statusCode = options?.statusCode
    this.context = options?.context
    this.suggestion = options?.suggestion
  }
}

export class RegistryNotFoundError extends RegistryError {
  constructor(itemName: string, options?: { registry?: string }) {
    super(`Item "${itemName}" not found`, RegistryErrorCode.NOT_FOUND, {
      statusCode: 404,
      context: { itemName, registry: options?.registry },
      suggestion: `Check if the item name is correct and the registry is accessible.`,
    })
    this.name = "RegistryNotFoundError"
  }
}

export class RegistryUnauthorizedError extends RegistryError {
  constructor(url: string) {
    super(`Unauthorized access to "${url}"`, RegistryErrorCode.UNAUTHORIZED, {
      statusCode: 401,
      context: { url },
      suggestion: `Check your authentication tokens.`,
    })
    this.name = "RegistryUnauthorizedError"
  }
}

export class RegistryForbiddenError extends RegistryError {
  constructor(url: string) {
    super(`Forbidden access to "${url}"`, RegistryErrorCode.FORBIDDEN, {
      statusCode: 403,
      context: { url },
      suggestion: `Check your permissions.`,
    })
    this.name = "RegistryForbiddenError"
  }
}

export class RegistryFetchError extends RegistryError {
  constructor(url: string, cause?: Error) {
    super(`Failed to fetch "${url}"`, RegistryErrorCode.FETCH_ERROR, {
      context: { url },
      suggestion: `Check your network connection and the URL.`,
    })
    this.name = "RegistryFetchError"
    if (cause) {
      this.cause = cause
    }
  }
}

export class RegistryNotConfiguredError extends RegistryError {
  constructor(registry: string) {
    super(
      `Registry "${registry}" is not configured`,
      RegistryErrorCode.NOT_CONFIGURED,
      {
        context: { registry },
        suggestion: `Add the registry to your components.json.`,
      }
    )
    this.name = "RegistryNotConfiguredError"
  }
}

export class RegistryLocalFileError extends RegistryError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to read local file "${filePath}"`, RegistryErrorCode.LOCAL_FILE_ERROR, {
      context: { filePath },
    })
    this.name = "RegistryLocalFileError"
    if (cause) {
      this.cause = cause
    }
  }
}

export class RegistryParseError extends RegistryError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, RegistryErrorCode.PARSE_ERROR, {
      cause: options?.cause,
    })
    this.name = "RegistryParseError"
  }
}

export class RegistryValidationError extends RegistryError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, RegistryErrorCode.VALIDATION_ERROR, { context })
    this.name = "RegistryValidationError"
  }
}

export class RegistryItemNotFoundError extends RegistryError {
  constructor(itemName: string, options?: { registry?: string }) {
    super(
      `Item "${itemName}" not found in registry`,
      RegistryErrorCode.ITEM_NOT_FOUND,
      {
        context: { itemName, registry: options?.registry },
        suggestion: `Check if the item name is correct.`,
      }
    )
    this.name = "RegistryItemNotFoundError"
  }
}

export class ConfigMissingError extends RegistryError {
  constructor(cwd: string) {
    super(`No components.json found in "${cwd}"`, RegistryErrorCode.CONFIG_MISSING, {
      context: { cwd },
      suggestion: `Run "npx shadcn-rn init" to initialize your project.`,
    })
    this.name = "ConfigMissingError"
  }
}

export class ConfigParseError extends RegistryError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, RegistryErrorCode.CONFIG_PARSE_ERROR, {
      cause: options?.cause,
    })
    this.name = "ConfigParseError"
  }
}
