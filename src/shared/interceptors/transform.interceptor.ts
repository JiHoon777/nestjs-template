import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { IApiResponse } from '../interfaces/api-response.interface'

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        errorCode: null,
        errorMessage: null,
      })),
    )
  }
}
