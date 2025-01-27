import type { BaseEntity } from './base.entity'
import type {
  CursorPaginationRequestDto,
  PagePaginationRequestDto,
} from '@shared/dto'
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
  protected async paginationQuery(payload: {
    /** 페이지네이션 옵션 */
    pageOpt: PagePaginationRequestDto
    /** 정렬 옵션. 키는 컬럼명, 값은 정렬 방향 */
    order?: { [key: string]: 'DESC' | 'ASC' }
    /** 커스텀 쿼리를 추가하기 위한 데코레이터 함수 */
    decorator?: (qb: SelectQueryBuilder<T_Entity>) => void
  }): Promise<[T_Entity[], number]> {
    const { page, size } = payload.pageOpt
    const take = size
    const skip = (page - 1) * take

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

  /**
   * 커서 기반(id는 PrimaryGeneratedColumn 라고 가정) 페이지네이션과 정렬을 지원하는 쿼리 메서드
   *
   * @description
   * - 커서 기반 페이지네이션을 구현한 메서드로, ID를 기준으로 데이터를 조회합니다.
   * - 정렬 옵션을 지원하며, 기본값으로 ID 내림차순 정렬을 사용합니다.
   * - 커스텀 쿼리 추가를 위한 데코레이터 패턴을 지원합니다.
   * - 필요에 따라 전체 개수(`total`)도 함께 반환합니다.
   *
   * @param payload 쿼리 옵션을 포함하는 객체
   * @param payload.cursorOpt - 커서 페이지네이션 옵션 (cursor: 마지막으로 조회한 ID, size: 페이지 크기)
   * @param payload.order - 정렬 옵션 (key: 컬럼명, value: 'DESC' | 'ASC')
   * @param payload.decorator - 커스텀 쿼리를 추가하기 위한 데코레이터 함수
   *
   * @returns [엔티티 배열, 다음 커서, 전체 개수]
   *
   * @example
   * const [items, nextCursor, total] = await this.cursorQuery({
   *   cursorOpt: { cursor: '100', size: 10 },
   *   order: { 'e.createdAt': 'DESC' },
   *   decorator: (qb) => qb.where('e.status = :status', { status: 'ACTIVE' })
   * });
   */
  protected async cursorQuery(payload: {
    cursorOpt: CursorPaginationRequestDto
    order?: Record<string, 'ASC' | 'DESC'>
    decorator?: (qb: SelectQueryBuilder<T_Entity>) => void
  }): Promise<[T_Entity[], string | undefined]> {
    const { cursorOpt, order, decorator } = payload
    const { cursor, size } = cursorOpt

    let qb = this.repository.createQueryBuilder('e')
    if (decorator) {
      decorator(qb)
    }

    // 2-1) 정렬 설정
    let idSortDirection: 'ASC' | 'DESC' = 'DESC'
    if (order && typeof order['e.id'] !== 'undefined') {
      // 만약 order 객체에 e.id 방향이 있다면 그걸 우선
      idSortDirection = order['e.id']
    }

    // order 파라미터가 없다면 기본 e.id DESC
    if (!order) {
      qb = qb.orderBy('e.id', 'DESC')
    } else {
      // 'e.id'를 제외한 정렬 항목을 추가
      const orderEntries = Object.entries(order).filter(
        ([key, _]) => key !== 'e.id',
      )
      orderEntries.forEach(([key, value]) => {
        qb.addOrderBy(key, value)
      })

      // 항상 'e.id'를 마지막 정렬 항목으로 추가하여 안정 정렬 보장
      qb.addOrderBy('e.id', idSortDirection)
    }

    // 2-2) 커서 조건 (ID 기준)
    if (cursor) {
      // 정렬 방향에 따라 연산자 결정
      const operator = idSortDirection === 'DESC' ? '<' : '>'
      qb = qb.andWhere(`e.id ${operator} :cursor`, { cursor })
    }

    // 2-3) 페이지 사이즈 + 1 만큼 조회
    qb = qb.take(size + 1)

    const items = await qb.getMany()

    // 3) 다음 커서 계산
    let nextCursor: string | undefined
    if (items.length > size) {
      // size+1개를 가져왔으므로, 마지막 1개는 다음 페이지가 존재한다는 신호
      // 다음 커서는 현재 페이지의 "마지막으로 포함된 아이템"의 ID (배열에서 인덱스 size-1)
      nextCursor = String(items[size - 1].id)
      items.pop() // 초과로 가져온 아이템은 현재 페이지에서는 제외
    }

    return [items, nextCursor]
  }

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
