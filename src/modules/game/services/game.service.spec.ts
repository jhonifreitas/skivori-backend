import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ExchangeRateService } from 'src/core/services/exchange-rate/exchange-rate.service';

import { Fruit, SPIN_COST } from '../constants/slot-machine';
import { GameService } from './game.service';

/**
 * Reels (index → fruit):
 * Reel 1: 0:cherry 1:lemon 2:apple 3:lemon 4:banana 5:banana 6:lemon 7:lemon
 * Reel 2: 0:lemon 1:apple 2:lemon 3:lemon 4:cherry 5:apple 6:banana 7:lemon
 * Reel 3: 0:lemon 1:apple 2:lemon 3:apple 4:cherry 5:lemon 6:banana 7:lemon
 *
 * spin uses `reel[Math.floor(Math.random() * reel.length)]` with length 8,
 * so returning `index / 8` from Math.random() selects a specific index.
 */
const mockReels = (indexes: [number, number, number]): void => {
  const sequence = indexes.map((index) => index / 8);
  let call = 0;
  jest
    .spyOn(Math, 'random')
    .mockImplementation(() => sequence[call++ % sequence.length]);
};

describe('GameService', () => {
  let service: GameService;
  let exchangeRateService: { getExchangeRate: jest.Mock };

  beforeEach(async () => {
    exchangeRateService = { getExchangeRate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: ExchangeRateService,
          useValue: exchangeRateService,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('spin', () => {
    it('should throw BadRequestException when balance is lower than the spin cost', () => {
      expect(() => service.spin({ balance: 0 })).toThrow(BadRequestException);
      expect(() => service.spin({ balance: 0 })).toThrow(
        'Insufficient balance.',
      );
    });

    it('should always charge the spin cost', () => {
      mockReels([1, 0, 0]); // lemon, lemon, lemon (no two-in-a-row reward)
      const result = service.spin({ balance: 20 });
      expect(result.cost).toBe(SPIN_COST);
    });

    it('should reward 50 coins for 3 cherries in a row', () => {
      mockReels([0, 4, 4]); // cherry, cherry, cherry
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.CHERRY, Fruit.CHERRY, Fruit.CHERRY]);
      expect(result.win).toBe(50);
      expect(result.coins).toBe(20 - SPIN_COST + 50);
    });

    it('should reward 40 coins for 2 cherries in a row', () => {
      mockReels([0, 4, 0]); // cherry, cherry, lemon
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.CHERRY, Fruit.CHERRY, Fruit.LEMON]);
      expect(result.win).toBe(40);
      expect(result.coins).toBe(20 - SPIN_COST + 40);
    });

    it('should reward 20 coins for 3 apples in a row', () => {
      mockReels([2, 1, 1]); // apple, apple, apple
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.APPLE, Fruit.APPLE, Fruit.APPLE]);
      expect(result.win).toBe(20);
      expect(result.coins).toBe(20 - SPIN_COST + 20);
    });

    it('should reward 10 coins for 2 apples in a row', () => {
      mockReels([2, 1, 0]); // apple, apple, lemon
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.APPLE, Fruit.APPLE, Fruit.LEMON]);
      expect(result.win).toBe(10);
      expect(result.coins).toBe(20 - SPIN_COST + 10);
    });

    it('should reward 15 coins for 3 bananas in a row', () => {
      mockReels([4, 6, 6]); // banana, banana, banana
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.BANANA, Fruit.BANANA, Fruit.BANANA]);
      expect(result.win).toBe(15);
      expect(result.coins).toBe(20 - SPIN_COST + 15);
    });

    it('should reward 5 coins for 2 bananas in a row', () => {
      mockReels([4, 6, 0]); // banana, banana, lemon
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.BANANA, Fruit.BANANA, Fruit.LEMON]);
      expect(result.win).toBe(5);
      expect(result.coins).toBe(20 - SPIN_COST + 5);
    });

    it('should reward 3 coins for 3 lemons in a row', () => {
      mockReels([1, 0, 0]); // lemon, lemon, lemon
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.LEMON, Fruit.LEMON, Fruit.LEMON]);
      expect(result.win).toBe(3);
      expect(result.coins).toBe(20 - SPIN_COST + 3);
    });

    it('should not reward 2 lemons in a row', () => {
      mockReels([1, 0, 1]); // lemon, lemon, apple
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.LEMON, Fruit.LEMON, Fruit.APPLE]);
      expect(result.win).toBe(0);
      expect(result.coins).toBe(20 - SPIN_COST);
    });

    it('should not reward when there is no match (apple, cherry, apple)', () => {
      mockReels([2, 4, 1]); // apple, cherry, apple
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.APPLE, Fruit.CHERRY, Fruit.APPLE]);
      expect(result.win).toBe(0);
      expect(result.coins).toBe(20 - SPIN_COST);
    });

    it('should not reward when the matching pair is on the last two reels (lemon, apple, apple)', () => {
      mockReels([1, 1, 1]); // lemon, apple, apple
      const result = service.spin({ balance: 20 });
      expect(result.reels).toEqual([Fruit.LEMON, Fruit.APPLE, Fruit.APPLE]);
      expect(result.win).toBe(0);
      expect(result.coins).toBe(20 - SPIN_COST);
    });
  });

  describe('findAll', () => {
    it('should return all games when search is undefined', () => {
      const result = service.findAll({});
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter games by title (case-insensitive)', () => {
      const result = service.findAll({ search: 'legacy of dead' });
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((game) =>
          game.title.toLowerCase().includes('legacy of dead'),
        ),
      ).toBe(true);
    });

    it('should filter games by providerName (case-insensitive)', () => {
      const result = service.findAll({ search: 'pragmatic play' });
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((game) =>
          game.providerName.toLowerCase().includes('pragmatic play'),
        ),
      ).toBe(true);
    });

    it('should return an empty array when no game matches the search', () => {
      const result = service.findAll({ search: 'no-game-should-match-this' });
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return the game when the id exists', () => {
      const game = service.findOne('playngo_legacy-of-dead');
      expect(game).toBeDefined();
      expect(game.id).toBe('playngo_legacy-of-dead');
    });

    it('should throw NotFoundException when the id does not exist', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(
        NotFoundException,
      );
      expect(() => service.findOne('non-existent-id')).toThrow(
        'Game not found.',
      );
    });
  });

  describe('exchangeCurrency', () => {
    it('should multiply each conversion rate by the amount', async () => {
      exchangeRateService.getExchangeRate.mockResolvedValue({
        conversion_rates: { USD: 1.1, BRL: 6, EUR: 1 },
      });

      const result = await service.exchangeCurrency({
        currency: 'EUR',
        amount: 10,
      });

      expect(exchangeRateService.getExchangeRate).toHaveBeenCalledWith('EUR');
      expect(result).toEqual([
        { currency: 'USD', amount: 11 },
        { currency: 'BRL', amount: 60 },
        { currency: 'EUR', amount: 10 },
      ]);
    });

    it('should return an empty array when there are no conversion rates', async () => {
      exchangeRateService.getExchangeRate.mockResolvedValue({
        conversion_rates: {},
      });

      const result = await service.exchangeCurrency({
        currency: 'EUR',
        amount: 10,
      });

      expect(result).toEqual([]);
    });
  });
});
