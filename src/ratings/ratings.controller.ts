import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RateMovieDto } from './dto/rate-movie.dto';
import { RatingsService } from './ratings.service';

@Controller('movies')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':id/rating')
  rate(@Param('id', ParseIntPipe) movieId: number, @Body() dto: RateMovieDto) {
    return this.ratingsService.rateMovie(movieId, dto);
  }
}
