import {Request, Response, NextFunction} from 'express'
import {Unauthorized} from '@itinari/lib-http-status'

declare module 'express' {
  interface Request {
    ctx: {
      internalRequest: boolean
    }
  }
}

export interface VerifyFunction {
  (token: string): void | boolean | Promise<boolean | void>
}

export interface Options {
  header: string
  verify: VerifyFunction
}

export function isInternalRequest(options: Options) {
  return async function(req: Request, _res: Response, next: NextFunction) {
    try {
      req.ctx = Object.assign({internalRequest: false}, req.ctx)

      const token = req.header(options.header)
      if (!token) {
        return next()
      }

      const isVerified = await options.verify(token)
      req.ctx.internalRequest = isVerified || false

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export function requireInternalRequest(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.ctx.internalRequest === false) {
    return next(new Unauthorized('Internal request required.'))
  }
  return next()
}
