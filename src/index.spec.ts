import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {expect} from 'chai'

chai.use(chaiAsPromised)

import {Unauthorized} from '@itinari/lib-http-status'
import {isInternalRequest, requireInternalRequest} from '.'

describe('Internal Request', () => {
  describe('isInternalRequest', () => {
    const options = {
      header: 'X-Test-Header',
      verify: (token) => {
        if (token === 'test-token-false') {
          return false
        } else if (token === 'test-token-throw') {
          throw new Unauthorized()
        }
        return true
      },
    }

    it('should be a middleware factory', () => {
      expect(isInternalRequest).a('function')
      expect(isInternalRequest.length).equals(1)
      expect(isInternalRequest(options)).a('function')
      expect(isInternalRequest(options).length).equals(3)
    })

    it('should set req.ctx.internalRequest to false -- no header set', () => {
      const req: any = {
        header: () => {
          return undefined
        },
      }

      return new Promise((resolve, reject) => {
        isInternalRequest(options)(req, null, (error) => {
          if (error) {
            return reject(error)
          }

          expect(req).haveOwnProperty('ctx')
          expect(req.ctx.internalRequest).equals(false)
          resolve()
        })
      })
    })

    it('should set req.ctx.internalRequest to false -- not verified', () => {
      const req: any = {
        header: () => {
          return 'test-token-false'
        },
      }

      return new Promise((resolve, reject) => {
        isInternalRequest(options)(req, null, (error) => {
          if (error) {
            return reject(error)
          }

          expect(req).haveOwnProperty('ctx')
          expect(req.ctx.internalRequest).equals(false)
          resolve()
        })
      })
    })

    it('should set req.ctx.internalRequest to true -- verified', () => {
      const req: any = {
        header: () => {
          return 'test-token'
        },
      }

      return new Promise((resolve, reject) => {
        isInternalRequest(options)(req, null, (error) => {
          if (error) {
            return reject(error)
          }

          expect(req).haveOwnProperty('ctx')
          expect(req.ctx.internalRequest).equals(true)
          resolve()
        })
      })
    })

    it('should call next with verify thrown error', () => {
      const req: any = {
        header: () => {
          return 'test-token-throw'
        },
      }

      const promise = new Promise((resolve, reject) => {
        isInternalRequest(options)(req, null, (error) => {
          if (error) {
            return reject(error)
          }
          resolve()
        })
      })

      return expect(promise).rejectedWith(Unauthorized)
    })
  })

  describe('requireInternalRequest', () => {
    it('should call next with error Unauthorized -- req.ctx.internalRequest = false', () => {
      const req: any = {
        ctx: {
          internalRequest: false,
        },
      }

      const promise = new Promise((resolve, reject) => {
        requireInternalRequest(req, null, (error) => {
          if (error) {
            return reject(error)
          }
          return resolve()
        })
      })

      return expect(promise).rejectedWith(Unauthorized)
    })
  })

  it('should call next without error -- req.ctx.internalRequest = true', () => {
    const req: any = {
      ctx: {
        internalRequest: true,
      },
    }

    const promise = new Promise((resolve, reject) => {
      requireInternalRequest(req, null, (error) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    })

    return expect(promise).fulfilled
  })
})
