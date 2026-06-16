import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { IExchangeRateResponse } from './exchange-rate.types';

@Injectable()
export class ExchangeRateService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('EXCHANGE_RATE_API_KEY');
    this.baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}`;
  }

  async getExchangeRate(currency: string): Promise<IExchangeRateResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IExchangeRateResponse>(
          `${this.baseUrl}/latest/${currency}`,
        ),
      );
      return data;
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException('Failed to get exchange rate');
    }
  }
}
