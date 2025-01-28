import { IConfiguration } from '@config'
import { User, UserService } from '@modules/user'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IConfiguration>,
  ) {}

  private get jwtConfig() {
    return this.configService.get('jwt', { infer: true })
  }

  async signin(user: User): Promise<{
    user: User
    accessToken: string
    refreshToken: string
  }> {
    const { accessToken, refreshToken } = await this.generateTokens(user)

    const hashedRefreshToken = await hash(refreshToken, 10)
    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
    })

    return { user, accessToken, refreshToken }
  }

  async signup({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<Omit<User, 'password'>> {
    const hashedPassword = await hash(password, 10)
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    })

    const { password: _, ...result } = user
    return result
  }

  async signout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null)

    return { message: '로그아웃되었습니다.' }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email)

    if (user && (await compare(password, user.password))) {
      return user
    }

    return null
  }

  async validateUserRefreshToken(refreshToken: string, userId: number) {
    const user = await this.usersService.findById(userId)

    const isRefreshTokenMatching = await compare(
      refreshToken,
      user.refreshToken,
    )
    if (isRefreshTokenMatching) {
      const { password: _, ...result } = user
      return result
    }

    return null
  }

  private async generateTokens(user: Omit<User, 'password'>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId: user.id },
        {
          secret: this.jwtConfig.secretKey,
          expiresIn: this.jwtConfig.secretExpiration,
        },
      ),
      this.jwtService.signAsync(
        { userId: user.id },
        {
          secret: this.jwtConfig.refreshSecretKey,
          expiresIn: this.jwtConfig.refreshSecretExpiration,
        },
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }
}
