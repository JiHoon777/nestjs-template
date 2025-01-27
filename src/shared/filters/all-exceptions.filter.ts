import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { createErrorResponse } from '@shared/utils'
import { Response } from 'express'

import { ErrorCode } from '../consts/error-code.consts'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(this.constructor.name)

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const errorResponse = createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      exception.message ?? '서버 오류가 발생했습니다.',
    )
    let status = HttpStatus.INTERNAL_SERVER_ERROR

    this.logger.error(host)
    this.logger.error(exception)

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const errorResponse = exception.getResponse() as any

      return response
        .status(status)
        .json(
          createErrorResponse(
            errorResponse.cause ?? ErrorCode.INTERNAL_SERVER_ERROR,
            Array.isArray(errorResponse.message)
              ? errorResponse.message[0]
              : (errorResponse.message ?? exception.message),
          ),
        )
    }

    response.status(status).json(errorResponse)
  }
}
