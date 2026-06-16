import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { IdempotencyInterceptor } from 'src/core/interceptors/idempotency.interceptor';

import { ExchangeCurrencyDto } from './dto/exchange-currency.dto';
import { ListAllGameDto } from './dto/list-game.dto';
import { SpinGameDto } from './dto/spin-game.dto';
import { GameService } from './services/game.service';

// [Q5 - Performance] CacheInterceptor caches GET responses (keyed by URL +
// query string) in Redis, so repeated search keystrokes that hit the same
// query are served from cache instead of re-filtering the dataset.
@Controller('games')
@UseInterceptors(CacheInterceptor)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  findAll(@Query() query: ListAllGameDto) {
    return this.gameService.findAll(query);
  }

  @Get('exchange-currency')
  exchangeCurrency(@Query() query: ExchangeCurrencyDto) {
    return this.gameService.exchangeCurrency(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(id);
  }

  // [Q4 - Robustness] IdempotencyInterceptor requires an X-Idempotency-Key
  // header and de-duplicates retried spins so the same request is never
  // processed twice (avoids double-charging coins).
  @Post('spin')
  @UseInterceptors(IdempotencyInterceptor)
  spin(@Body() body: SpinGameDto) {
    return this.gameService.spin(body);
  }
}
