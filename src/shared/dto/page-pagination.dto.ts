import { IsArray, IsNumber, IsPositive } from 'class-validator'

export class PagePaginationRequestDto {
  @IsNumber()
  @IsPositive()
  page: number

  @IsNumber()
  @IsPositive()
  size: number
}

/**
 * 페이지네이션된 목록 응답을 위한 DTO 클래스
 * @template T - 목록에 포함될 데이터의 타입
 */
export class PagePaginationResponseDto<T> {
  @IsNumber()
  @IsPositive()
  total: number

  @IsNumber()
  @IsPositive()
  page: number

  @IsNumber()
  @IsPositive()
  size: number

  @IsArray()
  data: T[]

  /**
   * ListResponseDto 인스턴스를 생성하는 정적 팩토리 메서드
   * @param data - 현재 페이지의 데이터 목록
   * @param total - 전체 데이터 개수
   * @param page - 현재 페이지 번호
   * @param size - 페이지당 데이터 개수
   * @returns 생성된 ListResponseDto 인스턴스
   */
  static of<T>({
    data,
    total,
    page,
    size,
  }: {
    data: T[]
    total: number
    page: number
    size: number
  }): PagePaginationResponseDto<T> {
    const response = new PagePaginationResponseDto<T>()
    response.data = data
    response.total = total
    response.page = page
    response.size = size
    return response
  }
}
