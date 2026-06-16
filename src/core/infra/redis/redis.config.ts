import { RedisClientOptions } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';

export const createRedisConfig = (config: ConfigService): RedisClientOptions =>
  ({
    host: config.get<string>('REDIS_HOST') ?? 'localhost',
    port: config.get<number>('REDIS_PORT') ?? 6379,
    username: config.get<string>('REDIS_USERNAME'),
    password: config.get<string>('REDIS_PASSWORD'),
  }) as RedisClientOptions;
