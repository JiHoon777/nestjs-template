export interface IApiResponse<T> {
  success: boolean
  data: T
  errorCode: string | null
  errorMessage: string | null
}
