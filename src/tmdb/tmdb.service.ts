import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  TmdbGenre,
  TmdbGenreListResponse,
  TmdbMovie,
  TmdbPaginatedResponse,
} from './tmdb.types';

/**
 * Thin client over the TMDB REST API. Auth + base URL are configured on the
 * injected HttpService (see TmdbModule).
 */
@Injectable()
export class TmdbService {
  constructor(private readonly http: HttpService) {}

  async getGenres(): Promise<TmdbGenre[]> {
    const { data } = await firstValueFrom(
      this.http.get<TmdbGenreListResponse>('/genre/movie/list', {
        params: { language: 'en' },
      }),
    );
    return data.genres;
  }

  async getPopularMovies(
    page: number,
  ): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    const { data } = await firstValueFrom(
      this.http.get<TmdbPaginatedResponse<TmdbMovie>>('/movie/popular', {
        params: { page },
      }),
    );
    return data;
  }
}
