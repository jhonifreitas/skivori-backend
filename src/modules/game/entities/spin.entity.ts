import { ApiProperty } from '@nestjs/swagger';

import { Fruit } from '../constants/slot-machine';

export class SpinEntity {
  @ApiProperty({
    example: [Fruit.CHERRY, Fruit.APPLE, Fruit.LEMON],
  })
  reels: [Fruit, Fruit, Fruit];

  win: number;
  cost: number;
  coins: number;
}
