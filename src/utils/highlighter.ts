export function highlightCode(code: string, language: string = "typescript"): string {
  const keywords = [
    "import",
    "export",
    "from",
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "break",
    "continue",
    "class",
    "extends",
    "new",
    "this",
    "super",
    "async",
    "await",
    "try",
    "catch",
    "finally",
    "throw",
    "typeof",
    "instanceof",
    "in",
    "of",
    "default",
    "type",
    "interface",
    "enum",
    "namespace",
    "module",
    "declare",
    "abstract",
    "implements",
    "readonly",
    "private",
    "protected",
    "public",
    "static",
    "override",
    "as",
    "satisfies",
  ]

  const lines = code.split("\n")
  return lines
    .map((line) => {
      let highlighted = line

      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, "g")
        highlighted = highlighted.replace(regex, `\x1b[35m${keyword}\x1b[0m`)
      }

      highlighted = highlighted.replace(
        /(["'`])(.*?)\1/g,
        "\x1b[32m$1$2$1\x1b[0m"
      )

      return highlighted
    })
    .join("\n")
}
