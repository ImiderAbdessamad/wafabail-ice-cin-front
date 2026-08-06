export { extractIceFromFile, toIceJson } from './extractIce'
export { extractRcFromFile, toRcJson } from './extractRc'
export {
  type IceExtractionResult,
  type IceCertificateData,
  ICE_DOC_ID,
  isIceExtractionClient,
  parseIceCertificate,
  findBestIceNumber,
} from './iceTypes'
export {
  type RcExtractionResult,
  type RcCertificateData,
  RC_DOC_IDS,
  isRcDocument,
  parseRcDocument,
} from './rcTypes'
