import { NextFunction, Request, Response } from "express";

import { createMovieSchema, updateMovieSchema } from "./movie.schemas";
import * as movieService from "./movie.service";
import * as movieEvents from "./movie.events";

export async function streamMoviesHandler(req: Request, res: Response) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  const clientId = Date.now().toString() + Math.random().toString();
  movieEvents.addClient(clientId, res);

  req.on('close', () => {
    movieEvents.removeClient(clientId);
  });
}

export async function getMoviesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const movies = await movieService.getMovies();
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
}

export async function createMovieHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = createMovieSchema.parse(req.body);
    const movie = await movieService.createMovie(body);
    movieEvents.broadcast('MOVIE_CREATED', movie);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
}

export async function updateMovieHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const body = updateMovieSchema.parse(req.body);
    const movie = await movieService.updateMovie(id, body);
    movieEvents.broadcast('MOVIE_UPDATED', movie);
    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
}

export async function deleteMovieHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    await movieService.deleteMovie(id);
    movieEvents.broadcast('MOVIE_DELETED', { id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
