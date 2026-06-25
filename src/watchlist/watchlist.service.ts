import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WatchlistType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  /** Add a movie to a user's watchlist/favorites (idempotent per type). */
  async add(userId: number, dto: CreateWatchlistItemDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie ${dto.movieId} not found`);
    }

    return this.prisma.watchlistItem.upsert({
      where: {
        userId_movieId_type: {
          userId,
          movieId: dto.movieId,
          type: dto.type,
        },
      },
      create: { userId, movieId: dto.movieId, type: dto.type },
      update: {},
      include: { movie: true },
    });
  }

  list(userId: number, type?: WatchlistType) {
    return this.prisma.watchlistItem.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { movie: true },
    });
  }

  async remove(id: number, userId: number) {
    const item = await this.prisma.watchlistItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Watchlist item ${id} not found`);
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('Not your watchlist item');
    }
    await this.prisma.watchlistItem.delete({ where: { id } });
    return { deleted: true, id };
  }
}
