import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ExchangeRateService } from 'src/core/services/exchange-rate/exchange-rate.service';

import { ExchangeCurrencyDto } from './dto/exchange-currency.dto';
import { ListAllGameDto } from './dto/list-game.dto';
import { SpinGameDto } from './dto/spin-game.dto';
import { GameController } from './game.controller';
import { GameService } from './services/game.service';

describe('GameController', () => {
  let controller: GameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        GameService,
        {
          provide: ExchangeRateService,
          useValue: { getExchangeRate: jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ListAllGameDto', () => {
    it('should lowercase and trim the search value', () => {
      const dto = plainToInstance(ListAllGameDto, {
        search: '  Legacy OF Dead  ',
      });
      expect(dto.search).toBe('legacy of dead');
    });

    it('should be valid when search is omitted', async () => {
      const dto = plainToInstance(ListAllGameDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be valid with a string search value', async () => {
      const dto = plainToInstance(ListAllGameDto, { search: 'pragmatic' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('pragmatic');
    });
  });

  describe('SpinGameDto', () => {
    it('should be valid with a balance of at least 1', async () => {
      const dto = plainToInstance(SpinGameDto, { balance: 20 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be invalid when balance is below 1', async () => {
      const dto = plainToInstance(SpinGameDto, { balance: 0 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid when balance is not a number', async () => {
      const dto = plainToInstance(SpinGameDto, { balance: 'twenty' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ExchangeCurrencyDto', () => {
    it('should be valid with a non-empty currency and an amount of at least 1', async () => {
      const dto = plainToInstance(ExchangeCurrencyDto, {
        currency: 'EUR',
        amount: 10,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be invalid when currency is empty', async () => {
      const dto = plainToInstance(ExchangeCurrencyDto, {
        currency: '',
        amount: 10,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid when amount is below 1', async () => {
      const dto = plainToInstance(ExchangeCurrencyDto, {
        currency: 'EUR',
        amount: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid when amount is not a number', async () => {
      const dto = plainToInstance(ExchangeCurrencyDto, {
        currency: 'EUR',
        amount: 'ten',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be valid when amount is omitted', async () => {
      const dto = plainToInstance(ExchangeCurrencyDto, {
        currency: 'EUR',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
