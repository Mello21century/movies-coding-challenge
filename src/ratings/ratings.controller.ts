import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
import { RateMovieDto } from './dto/rate-movie.dto';
import { RatingsService } from './ratings.service';

@Controller('movies')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':id/rating')
  rate(
    @Param('id', ParseIntPipe) movieId: number,
    @CurrentUser() user: AuthUser,
    @Body() dto: RateMovieDto,
  ) {
    return this.ratingsService.rateMovie(movieId, user.userId, dto);
  }
}
