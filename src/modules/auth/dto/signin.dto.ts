import { User } from '@modules/user'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class SigninRequestDto {
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MinLength(6)
  @ApiProperty()
  password: string
}

export class SigninResponseDto extends OmitType(User, ['password']) {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string
}
