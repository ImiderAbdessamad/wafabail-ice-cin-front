import type { IceWorkspaceStorage } from '../types'

const ROOT_DIR = 'extract-workspaces'

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory()
  return root.getDirectoryHandle(ROOT_DIR, { create: true })
}

async function getWorkspaceDir(
  workspaceId: string,
  create = false
): Promise<FileSystemDirectoryHandle> {
  const root = await getRoot()
  return root.getDirectoryHandle(workspaceId, { create })
}

export class OpfsIceStorage implements IceWorkspaceStorage {
  static isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      'storage' in navigator &&
      !!navigator.storage?.getDirectory
    )
  }

  async create(workspaceId: string): Promise<void> {
    await getWorkspaceDir(workspaceId, true)
  }

  async writeText(
    workspaceId: string,
    fileName: string,
    content: string
  ): Promise<void> {
    const dir = await getWorkspaceDir(workspaceId, true)
    const handle = await dir.getFileHandle(fileName, { create: true })
    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  async writeBinary(
    workspaceId: string,
    fileName: string,
    data: ArrayBuffer
  ): Promise<void> {
    const dir = await getWorkspaceDir(workspaceId, true)
    const handle = await dir.getFileHandle(fileName, { create: true })
    const writable = await handle.createWritable()
    await writable.write(data)
    await writable.close()
  }

  async remove(workspaceId: string): Promise<void> {
    try {
      const root = await getRoot()
      await root.removeEntry(workspaceId, { recursive: true })
    } catch {
    }
  }

  async exists(workspaceId: string): Promise<boolean> {
    try {
      await getWorkspaceDir(workspaceId, false)
      return true
    } catch {
      return false
    }
  }
}
