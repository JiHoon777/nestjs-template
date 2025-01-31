import { IConfiguration } from '@config'
import { UserService } from '@modules/user'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { IJwtPayload } from '../auth.common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UserService,
    configService: ConfigService<IConfiguration>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt', { infer: true }).secretKey,
    })
  }

  async validate(payload: IJwtPayload) {
    const user = await this.usersService.findById(payload.userId)

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException()
    }

    return user
  }
}
