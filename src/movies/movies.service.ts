import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListMoviesDto } from './dto/list-movies.dto';

type MovieWithGenres = Prisma.MovieGetPayload<{
  include: { genres: { include: { genre: true } } };
}>;

export interface MovieDto {
  id: number;
  tmdbId: number;
  title: string;
  overview: string | null;
  releaseDate: Date | null;
  posterPath: string | null;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  averageRating: number | null;
}

export interface PaginatedMovies {
  data: MovieDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class MoviesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(query: ListMoviesDto): Promise<PaginatedMovies> {
    const cacheKey = `movies:list:${JSON.stringify(query)}`;
    const cached = await this.cache.get<PaginatedMovies>(cacheKey);
    if (cached) {
      return cached;
    }

    const { page, limit, search, genre } = query;

    const where: Prisma.MovieWhereInput = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (genre) {
      where.genres = {
        some: { genre: { name: { equals: genre, mode: 'insensitive' } } },
      };
    }

    const [total, movies] = await this.prisma.$transaction([
      this.prisma.movie.count({ where }),
      this.prisma.movie.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { popularity: 'desc' },
        include: { genres: { include: { genre: true } } },
      }),
    ]);

    const averages = await this.prisma.rating.groupBy({
      by: ['movieId'],
      where: { movieId: { in: movies.map((m) => m.id) } },
      _avg: { value: true },
    });
    const avgMap = new Map(averages.map((a) => [a.movieId, a._avg.value]));

    const result = {
      data: movies.map((m) => this.toDto(m, avgMap.get(m.id) ?? null)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cache.set(cacheKey, result);
    return result;
  }

  async findOne(id: number): Promise<MovieDto> {
    const cacheKey = `movies:item:${id}`;
    const cached = await this.cache.get<MovieDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { genres: { include: { genre: true } } },
    });
    if (!movie) {
      throw new NotFoundException(`Movie ${id} not found`);
    }

    const agg = await this.prisma.rating.aggregate({
      where: { movieId: id },
      _avg: { value: true },
    });
    const dto = this.toDto(movie, agg._avg.value);
    await this.cache.set(cacheKey, dto);
    return dto;
  }

  /** Drop all cached movie list/detail entries (averages change on rating/sync). */
  async invalidate(): Promise<void> {
    await this.cache.clear();
  }

  private toDto(
    movie: MovieWithGenres,
    averageRating: number | null,
  ): MovieDto {
    return {
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
      popularity: movie.popularity,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
      genres: movie.genres.map((mg) => mg.genre.name),
      averageRating:
        averageRating === null ? null : Number(averageRating.toFixed(2)),
    };
  }
}
