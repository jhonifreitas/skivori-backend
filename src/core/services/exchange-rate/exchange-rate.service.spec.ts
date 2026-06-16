import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { ExchangeRateService } from './exchange-rate.service';
import { IExchangeRateResponse } from './exchange-rate.types';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let httpService: { get: jest.Mock };
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  const response: IExchangeRateResponse = {
    result: 'success',
    documentation: 'https://www.exchangerate-api.com/docs',
    terms_of_use: 'https://www.exchangerate-api.com/terms',
    time_last_update_unix: 0,
    time_last_update_utc: '',
    time_next_update_unix: 0,
    time_next_update_utc: '',
    base_code: 'EUR',
    conversion_rates: { EUR: 1, USD: 1.1, BRL: 6 },
  };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    cacheManager = { get: jest.fn(), set: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-api-key') },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should request the latest rates for the given currency and return the data', async () => {
    cacheManager.get.mockResolvedValue(undefined);
    httpService.get.mockReturnValue(of({ data: response }));

    const result = await service.getExchangeRate('EUR');

    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining('/latest/EUR'),
    );
    expect(result).toEqual(response);
  });
});
