import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

import { Public } from '../decorators'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get(Public, context.getHandler())

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  handleRequest(err, user, info) {
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
