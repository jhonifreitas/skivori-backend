import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { ExchangeRateService } from '../src/core/services/exchange-rate/exchange-rate.service';
import { GameController } from '../src/modules/game/game.controller';
import { GameService } from '../src/modules/game/services/game.service';

describe('GameController (e2e)', () => {
  let app: INestApplication;
  const getExchangeRate = jest.fn();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        GameService,
        { provide: ExchangeRateService, useValue: { getExchangeRate } },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('GET /games', () => {
    it('should return the list of games', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/games')
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('should filter the games by search', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/games')
        .query({ search: 'pragmatic' })
        .expect(200);

      expect(
        body.every((game: { providerName: string }) =>
          game.providerName.toLowerCase().includes('pragmatic'),
        ),
      ).toBe(true);
    });
  });

  describe('GET /games/:id', () => {
    it('should return 400 when the id is not a valid UUID', () => {
      return request(app.getHttpServer()).get('/games/not-a-uuid').expect(400);
    });

    it('should return 404 when the game is not found', () => {
      return request(app.getHttpServer())
        .get(`/games/${randomUUID()}`)
        .expect(404);
    });
  });

  describe('POST /games/spin', () => {
    it('should return 400 when the idempotency key header is missing', () => {
      return request(app.getHttpServer())
        .post('/games/spin')
        .send({ balance: 20 })
        .expect(400);
    });

    it('should return 400 when balance is below the minimum', () => {
      return request(app.getHttpServer())
        .post('/games/spin')
        .set('x-idempotency-key', randomUUID())
        .send({ balance: 0 })
        .expect(400);
    });

    it('should return the spin result with a valid request', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/games/spin')
        .set('x-idempotency-key', randomUUID())
        .send({ balance: 20 })
        .expect(201);

      expect(body).toHaveProperty('reels');
      expect(body).toHaveProperty('win');
      expect(body).toHaveProperty('cost', 1);
      expect(body).toHaveProperty('coins');
    });
  });

  describe('GET /games/exchange-currency', () => {
    it('should convert the amount using the exchange rates', async () => {
      getExchangeRate.mockResolvedValue({
        conversion_rates: { USD: 1.1, BRL: 6 },
      });

      const { body } = await request(app.getHttpServer())
        .get('/games/exchange-currency')
        .query({ currency: 'EUR', amount: 10 })
        .expect(200);

      expect(getExchangeRate).toHaveBeenCalledWith('EUR');
      expect(body).toEqual([
        { currency: 'USD', amount: 11 },
        { currency: 'BRL', amount: 60 },
      ]);
    });

    it('should return 400 when the query is invalid', () => {
      return request(app.getHttpServer())
        .get('/games/exchange-currency')
        .query({ currency: 'not-a-currency', amount: -1 })
        .expect(400);
    });
  });
});
