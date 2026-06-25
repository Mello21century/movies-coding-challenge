import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { WatchlistType } from '../../generated/prisma/client';

export class CreateWatchlistItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  movieId: number;

  /** WATCHLIST or FAVORITE. */
  @IsEnum(WatchlistType)
  type: WatchlistType;

  /** Temporary until Phase 9 (JWT auth) replaces it with the request user. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;
}
