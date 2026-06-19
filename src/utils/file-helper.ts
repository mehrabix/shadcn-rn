import * as fs from "fs/promises"
import * as path from "path"

export interface FileBackup {
  path: string
  content: string
  timestamp: number
}

const backups = new Map<string, FileBackup>()

export async function backupFile(filePath: string): Promise<FileBackup> {
  const content = await fs.readFile(filePath, "utf-8")
  const backup: FileBackup = {
    path: filePath,
    content,
    timestamp: Date.now(),
  }
  backups.set(filePath, backup)
  return backup
}

export async function restoreFile(filePath: string): Promise<boolean> {
  const backup = backups.get(filePath)
  if (!backup) {
    return false
  }

  await fs.writeFile(filePath, backup.content)
  backups.delete(filePath)
  return true
}

export function clearBackups(): void {
  backups.clear()
}
