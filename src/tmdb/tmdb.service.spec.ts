import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;
  let http: { get: jest.Mock };

  beforeEach(() => {
    http = { get: jest.fn() };
    service = new TmdbService(http as unknown as HttpService);
  });

  it('fetches genres', async () => {
    http.get.mockReturnValue(
      of({ data: { genres: [{ id: 1, name: 'Action' }] } }),
    );
    await expect(service.getGenres()).resolves.toEqual([
      { id: 1, name: 'Action' },
    ]);
    expect(http.get).toHaveBeenCalledWith('/genre/movie/list', {
      params: { language: 'en' },
    });
  });

  it('fetches popular movies for a page', async () => {
    http.get.mockReturnValue(
      of({ data: { page: 2, results: [], total_pages: 5, total_results: 0 } }),
    );
    const res = await service.getPopularMovies(2);
    expect(res.page).toBe(2);
    expect(http.get).toHaveBeenCalledWith('/movie/popular', {
      params: { page: 2 },
    });
  });
});
