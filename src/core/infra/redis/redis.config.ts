import { ConfigService } from '@nestjs/config';

export const createRedisUriConfig = (config: ConfigService): string => {
  const host = config.get<string>('REDIS_HOST') ?? 'localhost';
  const port = config.get<number>('REDIS_PORT') ?? 6379;
  const username = config.get<string>('REDIS_USERNAME');
  const password = config.get<string>('REDIS_PASSWORD');

  if (username && password) {
    return `redis://${username}:${password}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
};
