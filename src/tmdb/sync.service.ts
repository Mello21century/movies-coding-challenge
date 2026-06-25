import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TmdbService } from './tmdb.service';

/**
 * Pulls genres and popular movies from TMDB and upserts them into Postgres.
 * Idempotent (upsert by tmdbId) so it can run on a schedule or on demand
 * without creating duplicates.
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdb: TmdbService,
  ) {}

  async syncGenres(): Promise<number> {
    const genres = await this.tmdb.getGenres();
    await Promise.all(
      genres.map((g) =>
        this.prisma.genre.upsert({
          where: { tmdbId: g.id },
          create: { tmdbId: g.id, name: g.name },
          update: { name: g.name },
        }),
      ),
    );
    this.logger.log(`Synced ${genres.length} genres`);
    return genres.length;
  }

  async syncMovies(pages = 5): Promise<number> {
    const genres = await this.prisma.genre.findMany();
    const genreMap = new Map(genres.map((g) => [g.tmdbId, g.id]));
    let count = 0;

    for (let page = 1; page <= pages; page++) {
      const { results } = await this.tmdb.getPopularMovies(page);
      for (const m of results) {
        const genreLinks = m.genre_ids
          .map((id) => genreMap.get(id))
          .filter((id): id is number => id != null)
          .map((genreId) => ({ genreId }));

        const data = {
          title: m.title,
          overview: m.overview || null,
          releaseDate: m.release_date ? new Date(m.release_date) : null,
          posterPath: m.poster_path,
          popularity: m.popularity,
          voteAverage: m.vote_average,
          voteCount: m.vote_count,
        };

        await this.prisma.movie.upsert({
          where: { tmdbId: m.id },
          create: {
            tmdbId: m.id,
            ...data,
            genres: { create: genreLinks },
          },
          update: {
            ...data,
            genres: { deleteMany: {}, create: genreLinks },
          },
        });
        count++;
      }
    }

    this.logger.log(`Synced ${count} movies across ${pages} page(s)`);
    return count;
  }

  async syncAll(pages = 5): Promise<void> {
    await this.syncGenres();
    await this.syncMovies(pages);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySync(): Promise<void> {
    this.logger.log('Running scheduled TMDB sync');
    await this.syncAll();
  }
}
