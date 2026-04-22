import { Router } from "express";

import { createMovieHandler, deleteMovieHandler, getMoviesHandler, updateMovieHandler, streamMoviesHandler } from "./movie.controller";

const movieRouter = Router();

movieRouter.get("/", getMoviesHandler);
movieRouter.get("/stream", streamMoviesHandler);
movieRouter.post("/", createMovieHandler);
movieRouter.patch("/:id", updateMovieHandler);
movieRouter.delete("/:id", deleteMovieHandler);

export { movieRouter };
