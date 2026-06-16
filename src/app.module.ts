import KeyvRedis from '@keyv/redis';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { validate } from './core/config/env/env.validation';
import { AuthGuard } from './core/guards/auth.guard';
import { PrismaModule } from './core/infra/prisma/prisma.module';
import { createRedisConfig } from './core/infra/redis/redis.config';

import { GameModule } from './modules/game/game.module';

@Module({
  // [Q4 - Robustness] Global rate limiting guard protects every endpoint
  // against abuse / brute force (works together with ThrottlerModule below).
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    // [Q5 - Performance] Redis-backed cache store used by the CacheInterceptor
    // on the games controller to avoid re-computing the search on every hit.
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('CACHE_TTL') ?? 500,
        stores: [new KeyvRedis(createRedisConfig(config))],
      }),
    }),
    HttpModule.register({
      global: true,
    }),
    // [Q4 - Robustness] Rate limiting: max 10 requests per second per client.
    ThrottlerModule.forRoot([{ ttl: 1_000, limit: 10 }]),
    PrismaModule,
    GameModule,
  ],
})
export class AppModule {}
