import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ITransformParams } from 'src/core/types/transform.type';

export class ListAllGameDto {
  // [Q5 - Performance] Normalizing the search term (lowercase + trim) collapses
  // variations like "Book", "book " and "BOOK" into a single cache key,
  // increasing the CacheInterceptor hit rate and reducing redundant filtering.
  @IsString()
  @IsOptional()
  @Transform(({ value }: ITransformParams) => value.toLowerCase().trim())
  search?: string;
}
