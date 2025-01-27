import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.url}`)

    // 응답 완료 후 상태코드 로깅
    res.on('finish', () => {
      this.logger.log(`${req.method} ${req.url} ${res.statusCode}`)
    })

    next()
  }
}
