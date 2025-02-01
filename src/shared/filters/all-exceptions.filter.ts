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
    // const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const errorResponse = createErrorResponse(
      ErrorCode.InternalServerError,
      exception.message ?? '서버 오류가 발생했습니다.',
    )

    this.logger.error(exception.message)

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as any

      return response
        .status(exception.getStatus())
        .json(
          createErrorResponse(
            ErrorCode[errorResponse.message] ?? ErrorCode.InternalServerError,
            Array.isArray(errorResponse.message)
              ? errorResponse.message[0]
              : (errorResponse.message ?? exception.message),
          ),
        )
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse)
  }
}
