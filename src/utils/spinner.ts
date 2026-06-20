import { log } from "./logger"

export interface Spinner {
  start: (text?: string) => Spinner
  stop: (text?: string) => Spinner
  succeed: (text?: string) => Spinner
  fail: (text?: string) => Spinner
  warn: (text?: string) => Spinner
  info: (text?: string) => Spinner
  clear: () => Spinner
}

export function createSpinner(text?: string): Spinner {
  let currentText = text || ""
  let isRunning = false
  let interval: ReturnType<typeof setInterval> | null = null
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

  const spinner: Spinner = {
    start: (newText?: string) => {
      if (newText) currentText = newText
      isRunning = true
      let frameIndex = 0

      interval = setInterval(() => {
        process.stdout.write(`\r${frames[frameIndex]} ${currentText}`)
        frameIndex = (frameIndex + 1) % frames.length
      }, 80)

      return spinner
    },
    stop: (newText?: string) => {
      if (interval) clearInterval(interval)
      isRunning = false
      if (newText) currentText = newText
      process.stdout.write("\r")
      return spinner
    },
    succeed: (newText?: string) => {
      if (interval) clearInterval(interval)
      isRunning = false
      log(`✓ ${newText || currentText}`)
      return spinner
    },
    fail: (newText?: string) => {
      if (interval) clearInterval(interval)
      isRunning = false
      log(`✗ ${newText || currentText}`)
      return spinner
    },
    warn: (newText?: string) => {
      if (interval) clearInterval(interval)
      isRunning = false
      log(`⚠ ${newText || currentText}`)
      return spinner
    },
    info: (newText?: string) => {
      if (interval) clearInterval(interval)
      isRunning = false
      log(`ℹ ${newText || currentText}`)
      return spinner
    },
    clear: () => {
      if (interval) clearInterval(interval)
      isRunning = false
      process.stdout.write("\r")
      return spinner
    },
  }

  return spinner
}

export const spinner = createSpinner
