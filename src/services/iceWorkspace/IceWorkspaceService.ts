import type { IceExtractionResult } from '../ocr/iceTypes'
import type { RcExtractionResult } from '../ocr/rcTypes'
import type {
  IceWorkspaceMeta,
  IceWorkspacePayload,
  IceWorkspaceStorage,
} from './types'
import { MemoryIceStorage } from './storage/memoryStorage'
import { OpfsIceStorage } from './storage/opfsStorage'

function createStorage(): IceWorkspaceStorage {
  return OpfsIceStorage.isSupported()
    ? new OpfsIceStorage()
    : new MemoryIceStorage()
}

function createWorkspaceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `extract-${crypto.randomUUID()}`
  }
  return `extract-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function extensionFromFile(file: File): string {
  const fromName = file.name.includes('.')
    ? file.name.split('.').pop()?.toLowerCase()
    : ''
  if (fromName) return fromName
  if (file.type.includes('pdf')) return 'pdf'
  if (file.type.includes('png')) return 'png'
  if (file.type.includes('jpeg') || file.type.includes('jpg')) return 'jpg'
  return 'bin'
}

export class IceWorkspaceService {
  private readonly storage: IceWorkspaceStorage

  constructor(storage: IceWorkspaceStorage = createStorage()) {
    this.storage = storage
  }

  async createFromExtraction(
    file: File,
    extraction: IceExtractionResult
  ): Promise<IceWorkspacePayload> {
    const workspaceId = createWorkspaceId()
    const createdAt = new Date().toISOString()

    const meta: IceWorkspaceMeta = {
      workspaceId,
      createdAt,
      sourceFileName: file.name,
      sourceFileType: file.type || 'unknown',
      sourceFileSize: file.size,
    }

    const payload: IceWorkspacePayload = {
      meta,
      extraction,
      extractedData: {
        ice: extraction.ice,
        denomination: extraction.denomination,
        identifiantFiscal: extraction.identifiantFiscal,
        numeroRc: extraction.numeroRc,
        villeRc: extraction.villeRc,
        numeroCnss: extraction.numeroCnss,
      },
    }

    await this.storage.create(workspaceId)

    await Promise.all([
      this.storage.writeText(
        workspaceId,
        'ice-extracted.json',
        JSON.stringify(
          {
            ice: extraction.ice,
            denomination: extraction.denomination,
            identifiantFiscal: extraction.identifiantFiscal,
            numeroRc: extraction.numeroRc,
            villeRc: extraction.villeRc,
            numeroCnss: extraction.numeroCnss,
            confidence: extraction.confidence,
            source: extraction.source,
            workspaceId,
            createdAt,
          },
          null,
          2
        )
      ),
      this.storage.writeText(
        workspaceId,
        'ice-source-meta.json',
        JSON.stringify(meta, null, 2)
      ),
      this.storage.writeText(
        workspaceId,
        'ice-raw-text.txt',
        extraction.rawText || ''
      ),
      this.storage.writeBinary(
        workspaceId,
        `ice-source.${extensionFromFile(file)}`,
        await file.arrayBuffer()
      ),
    ])

    return payload
  }

  async writeRcExtraction(
    workspaceId: string | null | undefined,
    file: File,
    extraction: RcExtractionResult
  ): Promise<string> {
    const createdAt = new Date().toISOString()
    let id = workspaceId ?? null

    if (!id) {
      id = createWorkspaceId()
      await this.storage.create(id)
    }

    const meta = {
      workspaceId: id,
      createdAt,
      sourceFileName: file.name,
      sourceFileType: file.type || 'unknown',
      sourceFileSize: file.size,
    }

    await Promise.all([
      this.storage.writeText(
        id,
        'rc-extracted.json',
        JSON.stringify(
          {
            numeroRc: extraction.numeroRc,
            villeRc: extraction.villeRc,
            confidence: extraction.confidence,
            source: extraction.source,
            documentId: extraction.documentId,
            workspaceId: id,
            createdAt,
          },
          null,
          2
        )
      ),
      this.storage.writeText(
        id,
        'rc-source-meta.json',
        JSON.stringify(meta, null, 2)
      ),
      this.storage.writeText(
        id,
        'rc-raw-text.txt',
        extraction.rawText || ''
      ),
      this.storage.writeBinary(
        id,
        `rc-source.${extensionFromFile(file)}`,
        await file.arrayBuffer()
      ),
    ])

    return id
  }

  async delete(workspaceId: string | null | undefined): Promise<void> {
    if (!workspaceId) return
    await this.storage.remove(workspaceId)
  }
}

export const iceWorkspaceService = new IceWorkspaceService()
