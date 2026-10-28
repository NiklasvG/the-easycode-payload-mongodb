import { APIError, type CollectionBeforeOperationHook } from 'payload'
import { createRequestLimiter } from '@/utilities/publicRequestLimits'
const allowAuthentication = createRequestLimiter(60, 10)
/** Authentication and reset emails are intentional public flows, with a bounded budget. */
export const limitAuthentication: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (!req.user && ['login', 'forgotPassword', 'resetPassword'].includes(operation) && !allowAuthentication(req.headers)) {
    throw new APIError('Too many authentication attempts', 429)
  }
  return args
}
