export interface MovieDto {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  posterUrl: string;
}

export type GetMoviesResponse = MovieDto[];

export type CreateMovieRequest = Omit<MovieDto, 'id'>;
