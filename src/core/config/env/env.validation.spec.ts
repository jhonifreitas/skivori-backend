import 'reflect-metadata';

import { Environment } from './env.enum';
import { validate } from './env.validation';

describe('env validate', () => {
  const validConfig = {
    NODE_ENV: Environment.Development,
    SECRET: 'secret',
    PORT: 3000,
    CACHE_TTL: 500,
    DATABASE_URL: 'postgresql://localhost:5432/skivori',
    EXCHANGE_RATE_API_KEY: 'api-key',
  };

  it('should return the validated config when it is valid', () => {
    const result = validate(validConfig);
    expect(result.SECRET).toBe('secret');
    expect(result.DATABASE_URL).toBe(validConfig.DATABASE_URL);
  });

  it('should throw when a required variable is missing', () => {
    const { SECRET: _SECRET, ...withoutSecret } = validConfig;
    expect(() => validate(withoutSecret)).toThrow();
  });

  it('should throw when a variable has an invalid value', () => {
    expect(() =>
      validate({ ...validConfig, NODE_ENV: 'invalid-env' }),
    ).toThrow();
  });
});
