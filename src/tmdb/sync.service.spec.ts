import { SyncService } from './sync.service';

describe('SyncService', () => {
  let service: SyncService;
  let prisma: {
    genre: { upsert: jest.Mock; findMany: jest.Mock };
    movie: { upsert: jest.Mock };
  };
  let tmdb: { getGenres: jest.Mock; getPopularMovies: jest.Mock };
  let cache: { clear: jest.Mock };

  beforeEach(() => {
    prisma = {
      genre: { upsert: jest.fn().mockResolvedValue({}), findMany: jest.fn() },
      movie: { upsert: jest.fn().mockResolvedValue({}) },
    };
    tmdb = { getGenres: jest.fn(), getPopularMovies: jest.fn() };
    cache = { clear: jest.fn().mockResolvedValue(undefined) };
    service = new SyncService(prisma as never, tmdb as never, cache as never);
  });

  it('syncs genres via upsert', async () => {
    tmdb.getGenres.mockResolvedValue([
      { id: 1, name: 'Action' },
      { id: 2, name: 'Comedy' },
    ]);
    const count = await service.syncGenres();
    expect(count).toBe(2);
    expect(prisma.genre.upsert).toHaveBeenCalledTimes(2);
  });

  it('syncs movies and maps genre ids (covers null/!null branches)', async () => {
    prisma.genre.findMany.mockResolvedValue([{ tmdbId: 28, id: 7 }]);
    tmdb.getPopularMovies.mockResolvedValue({
      results: [
        {
          id: 100,
          title: 'Empty fields',
          overview: '',
          release_date: '',
          poster_path: null,
          popularity: 1,
          vote_average: 5,
          vote_count: 10,
          genre_ids: [28, 999],
        },
        {
          id: 101,
          title: 'Full fields',
          overview: 'has overview',
          release_date: '2020-01-01',
          poster_path: '/p.jpg',
          popularity: 2,
          vote_average: 7,
          vote_count: 20,
          genre_ids: [28],
        },
      ],
    });
    const count = await service.syncMovies(1);
    expect(count).toBe(2);
    expect(prisma.movie.upsert).toHaveBeenCalledTimes(2);
  });

  it('syncMovies uses the default page count', async () => {
    prisma.genre.findMany.mockResolvedValue([]);
    tmdb.getPopularMovies.mockResolvedValue({ results: [] });
    const count = await service.syncMovies();
    expect(count).toBe(0);
    expect(tmdb.getPopularMovies).toHaveBeenCalledTimes(5);
  });

  it('syncAll runs genres + movies then clears cache', async () => {
    const genres = jest.spyOn(service, 'syncGenres').mockResolvedValue(1);
    const movies = jest.spyOn(service, 'syncMovies').mockResolvedValue(2);
    await service.syncAll(3);
    expect(genres).toHaveBeenCalled();
    expect(movies).toHaveBeenCalledWith(3);
    expect(cache.clear).toHaveBeenCalled();
  });

  it('daily cron delegates to syncAll', async () => {
    const all = jest.spyOn(service, 'syncAll').mockResolvedValue();
    await service.handleDailySync();
    expect(all).toHaveBeenCalled();
  });
});
