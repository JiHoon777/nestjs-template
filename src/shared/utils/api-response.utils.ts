import type { ErrorCode } from '@shared/consts'

export interface IApiResponse<T> {
  success: boolean
  data: T
  errorCode: string | null
  errorMessage: string | null
}

export function createSuccessResponse<T>(data: T): IApiResponse<T> {
  return {
    success: true,
    data,
    errorCode: null,
    errorMessage: null,
  }
}

export function createErrorResponse<T = null>(
  errorCode: ErrorCode,
  errorMessage: string,
): IApiResponse<T> {
  return {
    success: false,
    data: null,
    errorCode,
    errorMessage,
  }
}
