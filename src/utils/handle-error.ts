export function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message)
    if (error.cause) {
      console.error("Caused by:", error.cause)
    }
  } else {
    console.error("An unknown error occurred:", error)
  }
  process.exit(1)
}
