import type { HttpStatus } from '@nestjs/common'

import { HttpException } from '@nestjs/common'

import { ErrorCode } from '../consts'
import { ErrorCodeMessage } from '../consts'

/**
 * 주어진 표현식이 참인지 확인합니다. 거짓일 경우 HttpException을 발생시킵니다.
 * @param expr - 검사할 표현식
 * @param code - 에러 코드
 * @param options - HttpException 옵션 (선택사항)
 * @throws {HttpException} 표현식이 거짓일 경우
 */
export function ensureIf<T>(
  expr: T,
  code: ErrorCode,
  options?: { statusCode?: HttpStatus },
): asserts expr {
  if (!expr) {
    throwException(code, options)
  }
}

/**
 * 주어진 에러 코드와 옵션으로 HttpException을 발생시킵니다.
 * @param code - 에러 코드
 * @param options - HttpException 옵션 (선택사항)
 * @throws {HttpException} 항상 예외를 발생시킵니다
 */
export function throwException(
  code: ErrorCode,
  options?: { statusCode?: HttpStatus },
): never {
  throw new HttpException(
    {
      cause: code,
      message: ErrorCodeMessage[code],
    },
    options?.statusCode ??
      (code === ErrorCode.INTERNAL_SERVER_ERROR ? 500 : 400),
  )
}
