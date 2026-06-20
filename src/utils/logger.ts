const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

export function log(message: string): void {
  console.log(message)
}

export function info(message: string): void {
  console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${message}`)
}

export function success(message: string): void {
  console.log(`${COLORS.green}✓${COLORS.reset} ${message}`)
}

export function warn(message: string): void {
  console.log(`${COLORS.yellow}⚠${COLORS.reset} ${message}`)
}

export function error(message: string): void {
  console.error(`${COLORS.red}✗${COLORS.reset} ${message}`)
}

export function bold(message: string): string {
  return `${COLORS.bright}${message}${COLORS.reset}`
}

export function br(): void {
  console.log("")
}

export const logger: {
  log: (message: string) => void
  info: (message: string) => void
  success: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  bold: (message: string) => string
  break: () => void
} = { log, info, success, warn, error, bold, break: br }
