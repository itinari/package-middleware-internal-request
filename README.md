# middleware-context

Internal request express middlewares

These middlewares are used to validate and authorize requests between
microservices.

## Usage

```typescript
import * as express from 'express'
import {Request, Response, NextFunction} from 'express'
import {isInternalRequest, requireInternalRequest} from '@itinari/middleware-internal-request'

const app = express()

app.use(
  isInternalRequest({
    header: 'X-My-Custom-Header-Token',
    verify: (token: string) {
      if (token !== 'FOOBAR') {
        return false
      }
      return true
    }
  })
)

app.get('/', requireInternalRequest, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).end()
})
```
