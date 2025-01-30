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
  email: string

  @Column('text')
  @Exclude({
    toPlainOnly: true,
  })
  password: string

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name: string | null

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

  @Column({ type: 'text', nullable: true })
  @Exclude({
    toPlainOnly: true,
  })
  refreshToken: string | null
}
