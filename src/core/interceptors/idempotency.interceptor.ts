import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly ttl: number = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
  private readonly processingTtl: number = 1000 * 30; // 30 seconds in milliseconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['x-idempotency-key'];

    if (!idempotencyKey)
      throw new BadRequestException('X-Idempotency-Key header is missing');
    if (typeof idempotencyKey !== 'string')
      throw new BadRequestException(
        'X-Idempotency-Key header must be a string',
      );

    const cachedResponse = await this.cacheManager.get(idempotencyKey);
    if (cachedResponse) {
      if (cachedResponse === 'PROCESSING')
        throw new ConflictException('Request is already being processed');

      return of(cachedResponse);
    }

    await this.cacheManager.set(
      idempotencyKey,
      'PROCESSING',
      this.processingTtl,
    );

    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      tap(async (response) => {
        await this.cacheManager.set(idempotencyKey, response, this.ttl);
      }),
      catchError((error: unknown) => {
        // Release the lock so a failed request can be safely retried.
        void this.cacheManager.del(idempotencyKey);
        return throwError(() => error);
      }),
    );
  }
}
