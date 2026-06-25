import { IsEnum, IsOptional } from 'class-validator';
import { WatchlistType } from '../../generated/prisma/client';

export class ListWatchlistDto {
  @IsOptional()
  @IsEnum(WatchlistType)
  type?: WatchlistType;
}
