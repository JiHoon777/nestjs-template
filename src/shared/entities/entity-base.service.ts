import type { BaseEntity } from './base.entity'
import type {
  FindOptionsWhere,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { Logger } from '@nestjs/common'
import { ErrorCode } from '@shared/consts'
import { ensureIf } from '@shared/utils'
import { omitBy } from 'lodash'

/**
 * 공통 쿼리 옵션을 위한 인터페이스
 * @template ENTITY BaseEntity를 상속받는 엔티티 타입
 */
export interface ICommonQueryPayload<ENTITY extends BaseEntity> {
  /** 페이지네이션 옵션 */
  pageOpt: { page: number; size: number }
  /** 정렬 옵션. 키는 컬럼명, 값은 정렬 방향 */
  order?: { [key: string]: 'DESC' | 'ASC' }
  /** 커스텀 쿼리를 추가하기 위한 데코레이터 함수 */
  decorator?: (qb: SelectQueryBuilder<ENTITY>) => void
}

/**
 * 기본 CRUD 및 쿼리 작업을 제공하는 베이스 서비스 클래스
 * @template T_Entity BaseEntity를 상속받는 엔티티 타입
 */
export abstract class BaseEntityService<T_Entity extends BaseEntity> {
  protected logger = new Logger(this.constructor.name)

  protected constructor(protected readonly repository: Repository<T_Entity>) {}

  /**
   * 새로운 엔티티를 생성합니다
   * @param input 생성할 엔티티 데이터
   * @returns 생성된 엔티티
   */
  async create(input: Partial<T_Entity>): Promise<T_Entity> {
    const repo = this.repository.create(input as T_Entity)
    return this.repository.save(repo)
  }

  /**
   * ID로 엔티티를 조회합니다
   * @param id 조회할 엔티티의 ID
   * @returns 조회된 엔티티
   * @throws {ErrorCode.COMMON_NOT_FOUND} 엔티티가 존재하지 않는 경우
   */
  async findById(id: number): Promise<T_Entity> {
    const entity = await this.repository.findOneBy({
      id,
    } as FindOptionsWhere<T_Entity>)
    ensureIf(entity, ErrorCode.COMMON_NOT_FOUND)
    return entity
  }

  /**
   * ID로 엔티티를 업데이트합니다
   * @param id 업데이트할 엔티티의 ID
   * @param input 업데이트할 데이터
   * @throws {ErrorCode.COMMON_NO_INPUT} 업데이트할 데이터가 없는 경우
   */
  async update(
    id: number,
    input: QueryDeepPartialEntity<T_Entity>,
  ): Promise<void> {
    ensureIf(
      Object.keys(omitBy(input, (v) => v === undefined)).length > 0,
      ErrorCode.COMMON_NO_INPUT,
    )

    await this.repository.update({ id } as FindOptionsWhere<T_Entity>, input)
  }

  /**
   * ID로 엔티티를 삭제합니다
   * @param id 삭제할 엔티티의 ID
   */
  async delete(id: number): Promise<void> {
    await this.repository
      .createQueryBuilder('e')
      .delete()
      .where(`e.id = :id`, { id })
      .execute()
  }

  /**
   * 페이지네이션과 정렬을 지원하는 쿼리 메서드
   * @param payload 쿼리 옵션
   * @param payload.pageOpt 페이지네이션 옵션 (page, size)
   * @param payload.order 정렬 옵션 (컬럼명: 'DESC' | 'ASC')
   * @param payload.decorator 커스텀 쿼리를 추가하기 위한 데코레이터 함수
   * @returns [엔티티 배열, 총 개수]
   * @example
   * ```typescript
   * const [articles, total] = await this.query({
   *   pageOpt: { page: 1, size: 10 },
   *   order: { created_at: 'DESC' },
   *   decorator: (qb) => {
   *     qb.where('published = :published', { published: true });
   *   },
   * });
   * ```
   */
  protected async paginationQuery(
    payload: ICommonQueryPayload<T_Entity>,
  ): Promise<[T_Entity[], number]> {
    const take = payload.pageOpt.size
    const skip = (payload.pageOpt.page - 1) * take

    let qb = this.repository.createQueryBuilder('e')

    if (payload.decorator) {
      payload.decorator(qb)
    }

    qb = qb.skip(skip).take(take)

    if (!payload.order) {
      qb = qb.orderBy(`e.id`, 'DESC')
    } else {
      Object.entries(payload.order).map(([key, value]) => {
        qb = qb.addOrderBy(key, value)
      })
    }

    return qb.getManyAndCount()
  }

  protected async cursorQuery() {}

  /**
   * 여러 엔티티를 한 번에 생성합니다
   * @param inputs 생성할 엔티티 데이터 배열
   * @returns 생성된 엔티티 배열
   */
  async createBulk(inputs: Partial<T_Entity>[]): Promise<T_Entity[]> {
    const entities = this.repository.create(inputs as T_Entity[])
    return this.repository.save(entities)
  }

  /**
   * 트랜잭션 내에서 작업을 실행합니다
   * @param callback 트랜잭션 내에서 실행할 콜백 함수
   * @returns 콜백 함수의 반환값
   */
  protected async withTransaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.repository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const result = await callback(queryRunner)
      await queryRunner.commitTransaction()
      return result
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }
}
