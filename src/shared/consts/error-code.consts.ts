export enum ErrorCode {
  CommonNotFound = 'COMMON_NOT_FOUND',
  CommonNoInput = 'COMMON_NO_INPUT',

  // 401
  Unauthorized = 'Unauthorized',

  // 500
  InternalServerError = 'InternalServerError',
}

export const ErrorCodeMessage: Record<ErrorCode, string> = {
  [ErrorCode.CommonNotFound]: 'Not Found',
  [ErrorCode.CommonNoInput]: 'No Input data',

  [ErrorCode.Unauthorized]: 'Unauthorized',

  [ErrorCode.InternalServerError]: 'Internal Server Error',
}
