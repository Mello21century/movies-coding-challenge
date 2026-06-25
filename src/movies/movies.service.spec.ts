import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';

const movieRow = {
  id: 1,
  tmdbId: 10,
  title: 'Test',
  overview: 'o',
  releaseDate: new Date('2020-01-01'),
  posterPath: null,
  popularity: 1,
  voteAverage: 5,
  voteCount: 2,
  genres: [{ genre: { name: 'Action' } }],
};

describe('MoviesService', () => {
  let service: MoviesService;
  let prisma: {
    $transaction: jest.Mock;
    movie: { findMany: jest.Mock; count: jest.Mock; findUnique: jest.Mock };
    rating: { groupBy: jest.Mock; aggregate: jest.Mock };
  };
  let cache: { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      movie: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
      rating: { groupBy: jest.fn(), aggregate: jest.fn() },
    };
    cache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    service = new MoviesService(prisma as never, cache as never);
  });

  describe('findAll', () => {
    it('returns cached result on hit (no DB)', async () => {
      cache.get.mockResolvedValue({ data: [], meta: {} });
      const res = await service.findAll({ page: 1, limit: 10 });
      expect(res).toEqual({ data: [], meta: {} });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('queries DB on miss, applies search/genre, caches result', async () => {
      prisma.$transaction.mockResolvedValue([1, [movieRow]]);
      prisma.rating.groupBy.mockResolvedValue([
        { movieId: 1, _avg: { value: 8 } },
      ]);
      const res = await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
        genre: 'action',
      });
      expect(res.meta.total).toBe(1);
      expect(res.data[0].averageRating).toBe(8);
      expect(res.data[0].genres).toEqual(['Action']);
      expect(cache.set).toHaveBeenCalled();
    });

    it('returns null averageRating when no ratings', async () => {
      prisma.$transaction.mockResolvedValue([1, [movieRow]]);
      prisma.rating.groupBy.mockResolvedValue([]);
      const res = await service.findAll({ page: 1, limit: 10 });
      expect(res.data[0].averageRating).toBeNull();
    });
  });

  describe('findOne', () => {
    it('returns cached on hit', async () => {
      cache.get.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
      expect(prisma.movie.findUnique).not.toHaveBeenCalled();
    });

    it('throws when not found', async () => {
      prisma.movie.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('returns movie with average on miss', async () => {
      prisma.movie.findUnique.mockResolvedValue(movieRow);
      prisma.rating.aggregate.mockResolvedValue({ _avg: { value: 7.5 } });
      const res = await service.findOne(1);
      expect(res.averageRating).toBe(7.5);
      expect(cache.set).toHaveBeenCalled();
    });
  });

  it('invalidate clears the cache', async () => {
    await service.invalidate();
    expect(cache.clear).toHaveBeenCalled();
  });
});
