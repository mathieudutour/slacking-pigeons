import { IncomingMessage, ServerResponse } from 'http'
import { RequestHandler } from 'micro'

const DEFAULT_ALLOW_METHODS = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
].join(',')

const DEFAULT_ALLOW_HEADERS = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept',
].join(',')

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

export function cors(handler: RequestHandler) {
  return (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Max-Age', '' + DEFAULT_MAX_AGE_SECONDS)

    res.setHeader('Access-Control-Allow-Origin', '*')

    res.setHeader('Access-Control-Allow-Methods', DEFAULT_ALLOW_METHODS)

    res.setHeader('Access-Control-Allow-Headers', DEFAULT_ALLOW_HEADERS)

    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
      return {}
    }

    return handler(req, res)
  }
}
