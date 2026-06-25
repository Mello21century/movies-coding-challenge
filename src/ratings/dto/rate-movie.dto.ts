import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class RateMovieDto {
  /**
   * Rating value, 1–10.
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  value: number;

  /**
   * Rating author. Temporary until Phase 9 (JWT auth), where it will be
   * replaced by the authenticated user from the request.
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;
}
