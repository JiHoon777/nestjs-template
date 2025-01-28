import type { UserRole } from '@modules/user'

import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

export const USER_ROLE_KEY = 'role'
export const Roles = (role: UserRole) => SetMetadata(USER_ROLE_KEY, role)

export interface IJwtPayload {
  userId: number
}
