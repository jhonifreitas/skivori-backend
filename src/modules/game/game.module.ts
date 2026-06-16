import { Module } from '@nestjs/common';

import { ExchangeRateService } from 'src/core/services/exchange-rate/exchange-rate.service';

import { GameController } from './game.controller';
import { GameService } from './services/game.service';

@Module({
  controllers: [GameController],
  providers: [GameService, ExchangeRateService],
})
export class GameModule {}
