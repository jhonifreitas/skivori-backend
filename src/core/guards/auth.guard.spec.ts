import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let configService: { get: jest.Mock };

  const createContext = (headers: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('super-secret'),
    };
    guard = new AuthGuard(configService as unknown as ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when a valid Bearer token matches the secret', () => {
    const context = createContext({ authorization: 'Bearer super-secret' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when the authorization header is missing', () => {
    const context = createContext({});
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the auth type is not Bearer', () => {
    const context = createContext({ authorization: 'Basic super-secret' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the token does not match the secret', () => {
    const context = createContext({ authorization: 'Bearer wrong-token' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the secret is not configured', () => {
    configService.get.mockReturnValue(undefined);
    const context = createContext({ authorization: 'Bearer super-secret' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
