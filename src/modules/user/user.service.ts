import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '@shared/entities'
import { Repository } from 'typeorm'

import { User } from './entities/user.entity'

@Injectable()
export class UserService extends BaseEntityService<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository)
  }

  async findOneByEmail(email: string) {
    return this.repository.findOne({ where: { email } })
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    const user = await this.findById(id)
    user.refreshToken = refreshToken
    return this.repository.save(user)
  }
}
