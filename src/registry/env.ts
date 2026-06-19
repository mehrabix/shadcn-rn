export function expandEnvVars(str: string): string {
  return str.replace(/\$\{(\w+)\}/g, (_, envVar) => {
    return process.env[envVar] || ""
  })
}

export function extractEnvVars(str: string): string[] {
  const matches = str.match(/\$\{(\w+)\}/g)
  if (!matches) {
    return []
  }
  return matches.map((match) => match.slice(2, -1))
}

export function hasEnvVars(str: string): boolean {
  return /\$\{(\w+)\}/.test(str)
}
