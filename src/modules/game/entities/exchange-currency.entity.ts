import { ApiProperty } from '@nestjs/swagger';

export class ExchangeCurrencyEntity {
  @ApiProperty({ example: 'EUR' })
  currency: string;
  amount: number;
}
