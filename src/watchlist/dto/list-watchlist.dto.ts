import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { WatchlistType } from '../../generated/prisma/client';

export class ListWatchlistDto {
  /** Temporary until Phase 9 (JWT auth) replaces it with the request user. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsEnum(WatchlistType)
  type?: WatchlistType;
}
