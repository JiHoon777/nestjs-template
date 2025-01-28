import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { ErrorCode } from '@shared/consts'

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        cause: ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED,
      })
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다')
    }

    if (err || !user) {
      throw err || new UnauthorizedException()
    }

    return user
  }
}
