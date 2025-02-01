import { User } from '@modules/user'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class SignupRequestDto {
  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @MinLength(6)
  @ApiProperty()
  password: string
}

export class SignupResponseDto extends OmitType(User, ['password']) {}
