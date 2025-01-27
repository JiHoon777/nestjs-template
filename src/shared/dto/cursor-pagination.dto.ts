import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class CursorPaginationRequestDto {
  @IsString()
  @IsOptional()
  cursor?: string

  @IsNumber()
  @IsPositive()
  size: number
}

/**
 * 커서 기반 페이지네이션된 목록 응답을 위한 DTO 클래스
 * @template T - 목록에 포함될 데이터의 타입
 */
export class CursorPaginationResponseDto<T> {
  @IsString()
  @IsOptional()
  nextCursor?: string

  @IsArray()
  data: T[]

  @IsNumber()
  @IsPositive()
  total: number

  @IsNumber()
  @IsPositive()
  size: number

  /**
   * CursorPaginationResponseDto 인스턴스를 생성하는 정적 팩토리 메서드
   * @param data - 현재 페이지의 데이터 목록
   * @param nextCursor - 다음 페이지의 커서
   * @returns 생성된 CursorPaginationResponseDto 인스턴스
   */
  static of<T>({
    data,
    nextCursor,
    total,
    size,
  }: {
    data: T[]
    nextCursor?: string
    total?: number
    size?: number
  }): CursorPaginationResponseDto<T> {
    const response = new CursorPaginationResponseDto<T>()
    response.data = data
    response.nextCursor = nextCursor
    if (total) {
      response.total = total
    }
    if (size) {
      response.size = size
    }
    return response
  }
}
