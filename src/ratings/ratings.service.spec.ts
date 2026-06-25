import { NotFoundException } from '@nestjs/common';
import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let prisma: {
    movie: { findUnique: jest.Mock };
    rating: { upsert: jest.Mock; aggregate: jest.Mock };
  };
  let cache: { clear: jest.Mock };

  beforeEach(() => {
    prisma = {
      movie: { findUnique: jest.fn() },
      rating: { upsert: jest.fn(), aggregate: jest.fn() },
    };
    cache = { clear: jest.fn().mockResolvedValue(undefined) };
    service = new RatingsService(prisma as never, cache as never);
  });

  it('throws when the movie does not exist', async () => {
    prisma.movie.findUnique.mockResolvedValue(null);
    await expect(service.rateMovie(1, 1, { value: 5 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('upserts the rating, recomputes average and clears cache', async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: 1 });
    prisma.rating.upsert.mockResolvedValue({});
    prisma.rating.aggregate.mockResolvedValue({
      _avg: { value: 6.5 },
      _count: 2,
    });
    const res = await service.rateMovie(1, 42, { value: 7 });
    expect(prisma.rating.upsert).toHaveBeenCalled();
    expect(res).toEqual({
      movieId: 1,
      value: 7,
      averageRating: 6.5,
      ratingsCount: 2,
    });
    expect(cache.clear).toHaveBeenCalled();
  });

  it('returns null average when there are no ratings', async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: 1 });
    prisma.rating.upsert.mockResolvedValue({});
    prisma.rating.aggregate.mockResolvedValue({
      _avg: { value: null },
      _count: 0,
    });
    const res = await service.rateMovie(1, 1, { value: 7 });
    expect(res.averageRating).toBeNull();
  });
});
