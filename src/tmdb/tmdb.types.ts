export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbGenreListResponse {
  genres: TmdbGenre[];
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
