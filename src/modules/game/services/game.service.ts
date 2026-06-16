import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ExchangeRateService } from 'src/core/services/exchange-rate/exchange-rate.service';

import {
  Fruit,
  REELS,
  REWARDS_THREE,
  REWARDS_TWO,
  SPIN_COST,
} from '../constants/slot-machine';
import { ExchangeCurrencyDto } from '../dto/exchange-currency.dto';
import { ListAllGameDto } from '../dto/list-game.dto';
import { SpinGameDto } from '../dto/spin-game.dto';
import { ExchangeCurrencyEntity } from '../entities/exchange-currency.entity';
import { GameEntity } from '../entities/game.entity';
import { SpinEntity } from '../entities/spin.entity';
import gamesJson from '../mocks/game-data.json';

@Injectable()
export class GameService {
  private readonly games: GameEntity[] = [];

  constructor(private readonly exchangeRateService: ExchangeRateService) {
    this.games = gamesJson;
  }

  findAll({ search }: ListAllGameDto): GameEntity[] {
    const filteredGames = this.games.filter(
      (game) =>
        game.title.toLowerCase().includes(search?.toLowerCase() ?? '') ||
        game.providerName.toLowerCase().includes(search?.toLowerCase() ?? ''),
    );
    return filteredGames;
  }

  findOne(id: string): GameEntity {
    const game = this.games.find((game) => game.id === id);
    if (!game) throw new NotFoundException('Game not found.');
    return game;
  }

  spin({ balance }: SpinGameDto): SpinEntity {
    const cost = SPIN_COST;
    if (balance < cost) throw new BadRequestException('Insufficient balance.');

    const reels = REELS.map(
      (reel) => reel[Math.floor(Math.random() * reel.length)],
    ) as [Fruit, Fruit, Fruit];

    const [first, second, third] = reels;
    let win = 0;
    if (first === second && second === third) {
      win = REWARDS_THREE[first] ?? 0;
    } else if (first === second) {
      win = REWARDS_TWO[second] ?? 0;
    }

    const coins = balance - cost + win;

    return { reels, win, cost, coins };
  }

  async exchangeCurrency({
    currency,
    amount,
  }: ExchangeCurrencyDto): Promise<ExchangeCurrencyEntity[]> {
    const exchangeRate =
      await this.exchangeRateService.getExchangeRate(currency);

    const value = amount ?? 1;

    const rates = Object.entries(exchangeRate.conversion_rates);

    return rates.map(([key, rate]) => ({
      currency: key,
      amount: rate * value,
    }));
  }
}
