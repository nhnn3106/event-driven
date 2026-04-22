import { Movie } from "@prisma/client";

import * as movieRepository from "./movie.repository";
import {
  CreateMovieRequest,
  GetMoviesResponse,
  MovieDto,
} from "./movie.types";

function toMovieDto(movie: Movie): MovieDto {
  return {
    id: movie.id,
    title: movie.title,
    description: movie.description || '',
    durationMinutes: movie.durationMinutes,
    posterUrl: movie.posterUrl || '',
  };
}

export async function createMovie(input: CreateMovieRequest): Promise<MovieDto> {
  const movie = await movieRepository.createMovie(input);
  return toMovieDto(movie);
}

export async function getMovies(): Promise<GetMoviesResponse> {
  const movies = await movieRepository.getMovies();
  return movies.map(toMovieDto);
}

export async function updateMovie(id: string, input: Partial<CreateMovieRequest>): Promise<MovieDto> {
  const movie = await movieRepository.updateMovie(id, input);
  return toMovieDto(movie);
}

export async function deleteMovie(id: string): Promise<void> {
  await movieRepository.deleteMovie(id);
}
