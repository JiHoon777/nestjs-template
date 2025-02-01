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
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { Auth } from './decorators/auth.decorator'
import { CurrentUser } from './decorators/current-user.decorator'
import { SigninRequestDto, SigninResponseDto } from './dto/signin.dto'
import { SignupRequestDto, SignupResponseDto } from './dto/signup.dto'
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOkResponse({ type: SignupResponseDto })
  @Post('signup')
  async signup(@Body() input: SignupRequestDto): Promise<SignupResponseDto> {
    return this.authService.signup(input)
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: SigninRequestDto })
  @ApiOkResponse({ type: SigninResponseDto })
  @Post('signin')
  signin(@CurrentUser() user: User): Promise<SigninResponseDto> {
    return this.authService.signin(user)
  }

  @UseGuards(JwtRefreshAuthGuard)
  @ApiExcludeEndpoint()
  @Post('refresh-token')
  refreshToken(@CurrentUser() user: User): Promise<SigninResponseDto> {
    return this.authService.signin(user)
  }

  @Auth()
  @Post('signout')
  signout(@CurrentUser() user: User): Promise<void> {
    return this.authService.signout(user.id)
  }

  @Auth()
  @ApiOkResponse({ type: User })
  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user
  }
}
