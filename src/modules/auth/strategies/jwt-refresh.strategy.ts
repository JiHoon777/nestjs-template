import { IConfiguration } from '@config'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { IJwtPayload } from '../auth.common'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService<IConfiguration>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Refresh,
      ]),
      secretOrKey: configService.get('jwt', { infer: true }).refreshSecretKey,
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: IJwtPayload) {
    const authUser = await this.authService.validateUserRefreshToken(
      request.cookies?.Refresh,
      payload.userId,
    )

    if (!authUser) {
      throw new UnauthorizedException()
    }

    return { id: authUser.id, email: authUser.email }
  }
}
