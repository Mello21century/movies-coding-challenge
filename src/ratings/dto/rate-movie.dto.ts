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
}
