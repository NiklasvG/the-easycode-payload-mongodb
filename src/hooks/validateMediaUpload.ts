import { APIError, type CollectionBeforeOperationHook } from 'payload'

export const MAX_MEDIA_BYTES = 20 * 1024 * 1024
export const validateMediaUpload: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if ((operation === 'create' || operation === 'update') && req.file && req.file.size > MAX_MEDIA_BYTES) {
    throw new APIError('Medien dürfen maximal 20 MiB groß sein.', 413)
  }
  return args
}
