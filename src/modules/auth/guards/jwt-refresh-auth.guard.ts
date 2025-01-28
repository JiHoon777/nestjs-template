import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException()
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException()
    }

    if (err || !user) {
      throw err || new UnauthorizedException()
    }

    return user
  }
}
