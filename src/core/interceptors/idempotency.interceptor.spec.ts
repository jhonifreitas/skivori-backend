import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of, throwError } from 'rxjs';

import { IdempotencyInterceptor } from './idempotency.interceptor';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let cacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const createContext = (headers: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as unknown as ExecutionContext;

  const createNext = (response: unknown): CallHandler => ({
    handle: jest.fn(() => of(response)),
  });

  beforeEach(async () => {
    cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should throw BadRequestException when the idempotency key header is missing', async () => {
    const context = createContext({});
    const next = createNext('response');

    await expect(interceptor.intercept(context, next)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when the idempotency key header is not a string', async () => {
    const context = createContext({ 'x-idempotency-key': ['a', 'b'] });
    const next = createNext('response');

    await expect(interceptor.intercept(context, next)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw ConflictException when a request is already being processed', async () => {
    cacheManager.get.mockResolvedValue('PROCESSING');
    const context = createContext({ 'x-idempotency-key': 'key-1' });
    const next = createNext('response');

    await expect(interceptor.intercept(context, next)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should return the cached response without calling the handler', async () => {
    const cached = { coins: 19 };
    cacheManager.get.mockResolvedValue(cached);
    const context = createContext({ 'x-idempotency-key': 'key-1' });
    const next = createNext('fresh-response');

    const result$ = await interceptor.intercept(context, next);
    const result = await firstValueFrom(result$);

    expect(result).toEqual(cached);
    expect(next.handle).not.toHaveBeenCalled();
  });

  it('should mark the request as processing, run the handler and cache its response', async () => {
    cacheManager.get.mockResolvedValue(undefined);
    const response = { coins: 19 };
    const context = createContext({ 'x-idempotency-key': 'key-1' });
    const next = createNext(response);

    const result$ = await interceptor.intercept(context, next);
    const result = await firstValueFrom(result$);

    expect(result).toEqual(response);
    expect(next.handle).toHaveBeenCalled();
    expect(cacheManager.set).toHaveBeenNthCalledWith(
      1,
      'key-1',
      'PROCESSING',
      expect.any(Number),
    );
    expect(cacheManager.set).toHaveBeenNthCalledWith(
      2,
      'key-1',
      response,
      expect.any(Number),
    );
  });

  it('should release the lock when the handler throws', async () => {
    cacheManager.get.mockResolvedValue(undefined);
    const context = createContext({ 'x-idempotency-key': 'key-1' });
    const error = new Error('handler failed');
    const next: CallHandler = {
      handle: jest.fn(() => throwError(() => error)),
    };

    const result$ = await interceptor.intercept(context, next);

    await expect(firstValueFrom(result$)).rejects.toThrow('handler failed');
    expect(cacheManager.del).toHaveBeenCalledWith('key-1');
  });
});
