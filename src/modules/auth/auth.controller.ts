import { User } from '@modules/user'
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { AuthService } from './auth.service'
import { Public } from './decorators'
import { CurrentUser } from './decorators/current-user.decorator'
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() input: { email: string; password: string }) {
    return this.authService.signup(input)
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(@CurrentUser() user: User) {
    return this.authService.signin(user)
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  refreshToken(@CurrentUser() user: User) {
    return this.authService.signin(user)
  }

  @Post('signout')
  signout(@CurrentUser() user: User) {
    return this.authService.signout(user.id)
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user
  }
}
