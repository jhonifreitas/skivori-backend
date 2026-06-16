import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsISO4217CurrencyCode,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

import { ITransformParams } from 'src/core/types/transform.type';

export class ExchangeCurrencyDto {
  @ApiProperty({ example: 'EUR' })
  @IsISO4217CurrencyCode()
  @Transform(({ value }: ITransformParams) => value.toUpperCase())
  currency: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }: ITransformParams) => Number(value))
  amount?: number;
}
