import request from "supertest";

import { createApp } from "../../src/app";
import * as movieService from "../../src/modules/movies/movie.service";

jest.mock("../../src/modules/movies/movie.service");

const mockedMovieService = movieService as jest.Mocked<typeof movieService>;

describe("movie routes", () => {
  const app = createApp();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("GET /api/movies returns movies", async () => {
    mockedMovieService.getMovies.mockResolvedValue([
      {
        id: "e34657a7-96ca-4288-b954-7f0392224f6a",
        title: "Inception",
        description: "A mind-bending science fiction thriller.",
        durationMinutes: 148,
        posterUrl: "https://example.com/inception.jpg",
      },
    ]);

    const response = await request(app).get("/api/movies");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(mockedMovieService.getMovies).toHaveBeenCalled();
  });

  it("POST /api/movies validates payload", async () => {
    const response = await request(app).post("/api/movies").send({
      title: "",
      durationMinutes: -1,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(mockedMovieService.createMovie).not.toHaveBeenCalled();
  });

  it("POST /api/movies creates a movie", async () => {
    mockedMovieService.createMovie.mockResolvedValue({
      id: "dfdb23f3-ba2c-4f45-96e7-90c95ff9ccd4",
      title: "Interstellar",
      description: "Explorers travel through a wormhole in space.",
      durationMinutes: 169,
      posterUrl: "https://example.com/interstellar.jpg",
    });

    const response = await request(app).post("/api/movies").send({
      title: "Interstellar",
      description: "Explorers travel through a wormhole in space.",
      durationMinutes: 169,
      posterUrl: "https://example.com/interstellar.jpg",
    });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Interstellar");
    expect(mockedMovieService.createMovie).toHaveBeenCalledTimes(1);
  });
});
