import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { ITransformParams } from 'src/core/types/transform.type';

import { Environment } from './env.enum';

// const isProd = process.env.NODE_ENV === Environment.Production;

export class EnvironmentDto {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  @IsString()
  @IsNotEmpty()
  SECRET: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  HOST?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }: ITransformParams) =>
    value.split(',').map((o) => o.trim()),
  )
  CORS_ORIGIN?: string;

  @IsNumber()
  @Min(0)
  @Max(10_000)
  @IsOptional()
  CACHE_TTL: number;

  // DATABASE
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  // REDIS
  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number;

  // EXCHANGE RATE API
  @IsString()
  @IsNotEmpty()
  EXCHANGE_RATE_API_KEY: string;
}
