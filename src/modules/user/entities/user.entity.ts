import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from '@shared/entities'
import { Exclude } from 'class-transformer'
import { Column, Entity } from 'typeorm'

import { UserRole } from '../enums/user-role.enum'

@Entity()
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'User Email',
  })
  email: string

  @Column('text')
  @Exclude({
    toPlainOnly: true,
  })
  @ApiHideProperty()
  password: string

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @ApiProperty({
    example: 'John',
    description: 'User Name',
  })
  name: string | null

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User Role',
  })
  role: UserRole

  @Column({ type: 'text', nullable: true })
  @Exclude({
    toPlainOnly: true,
  })
  @ApiHideProperty()
  refreshToken: string | null
}
