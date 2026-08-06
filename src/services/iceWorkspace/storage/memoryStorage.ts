import type { IceWorkspaceStorage } from '../types'

export class MemoryIceStorage implements IceWorkspaceStorage {
  private readonly folders = new Map<string, Map<string, string | ArrayBuffer>>()

  async create(workspaceId: string): Promise<void> {
    this.folders.set(workspaceId, new Map())
  }

  async writeText(
    workspaceId: string,
    fileName: string,
    content: string
  ): Promise<void> {
    const folder = this.folders.get(workspaceId)
    if (!folder) throw new Error(`Workspace introuvable: ${workspaceId}`)
    folder.set(fileName, content)
  }

  async writeBinary(
    workspaceId: string,
    fileName: string,
    data: ArrayBuffer
  ): Promise<void> {
    const folder = this.folders.get(workspaceId)
    if (!folder) throw new Error(`Workspace introuvable: ${workspaceId}`)
    folder.set(fileName, data)
  }

  async remove(workspaceId: string): Promise<void> {
    this.folders.delete(workspaceId)
  }

  async exists(workspaceId: string): Promise<boolean> {
    return this.folders.has(workspaceId)
  }
}
