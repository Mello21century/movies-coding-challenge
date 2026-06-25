import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RateMovieDto } from './dto/rate-movie.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert a user's rating for a movie, then return the movie's new average.
   * One rating per (user, movie) — re-rating updates the existing value.
   */
  async rateMovie(movieId: number, dto: RateMovieDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie ${movieId} not found`);
    }

    await this.prisma.rating.upsert({
      where: { userId_movieId: { userId: dto.userId, movieId } },
      create: { userId: dto.userId, movieId, value: dto.value },
      update: { value: dto.value },
    });

    const agg = await this.prisma.rating.aggregate({
      where: { movieId },
      _avg: { value: true },
      _count: true,
    });

    return {
      movieId,
      value: dto.value,
      averageRating:
        agg._avg.value === null ? null : Number(agg._avg.value.toFixed(2)),
      ratingsCount: agg._count,
    };
  }
}
