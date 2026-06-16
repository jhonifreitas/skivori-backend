import { IsNumber, Min } from 'class-validator';

export class SpinGameDto {
  @IsNumber()
  @Min(1)
  balance: number;
}
