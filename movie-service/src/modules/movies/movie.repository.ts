import { prisma } from "../../infrastructure/db/prisma";
import { CreateMovieRequest } from "./movie.types";

export async function createMovie(input: CreateMovieRequest) {
  return prisma.movie.create({
    data: {
      title: input.title,
      description: input.description,
      durationMinutes: input.durationMinutes,
      posterUrl: input.posterUrl,
    },
  });
}

export async function getMovies() {
  return prisma.movie.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateMovie(id: string, input: Partial<CreateMovieRequest>) {
  return prisma.movie.update({
    where: { id },
    data: input,
  });
}

export async function deleteMovie(id: string) {
  return prisma.movie.delete({
    where: { id },
  });
}
