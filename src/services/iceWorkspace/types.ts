import type { IceExtractionResult } from '../ocr'

export interface IceWorkspaceMeta {
  workspaceId: string
  createdAt: string
  sourceFileName: string
  sourceFileType: string
  sourceFileSize: number
}

export interface IceWorkspacePayload {
  meta: IceWorkspaceMeta
  extraction: IceExtractionResult
  extractedData: {
    ice: string | null
    denomination: string | null
    identifiantFiscal: string | null
    numeroRc: string | null
    villeRc: string | null
    numeroCnss: string | null
  }
}

export interface IceWorkspaceStorage {
  create(workspaceId: string): Promise<void>
  writeText(workspaceId: string, fileName: string, content: string): Promise<void>
  writeBinary(
    workspaceId: string,
    fileName: string,
    data: ArrayBuffer
  ): Promise<void>
  remove(workspaceId: string): Promise<void>
  exists(workspaceId: string): Promise<boolean>
}
