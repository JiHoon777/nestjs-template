import { ApiProperty } from '@nestjs/swagger'
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class BaseEntity {
  @ApiProperty({ example: 1, description: 'Entity ID' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Entity 생성 날짜',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Entity 수정 날짜',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date

  /**
   * 소프트 삭제를 위한 필드
   * null인 경우 삭제되지 않은 상태
   * Date가 있는 경우 해당 시점에 삭제된 상태
   * @Index()
   * @Column({ type: 'timestamp', nullable: true, default: null })
   * deletedAt: Date | null
   */
}
