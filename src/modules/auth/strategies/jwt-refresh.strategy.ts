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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt', { infer: true }).refreshSecretKey,
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: IJwtPayload) {
    const refreshToken = request.headers.authorization?.split('Bearer ')[1]
    const authUser = await this.authService.validateUserRefreshToken(
      refreshToken,
      payload.userId,
    )

    if (!authUser) {
      throw new UnauthorizedException()
    }

    return { id: authUser.id, email: authUser.email }
  }
}
