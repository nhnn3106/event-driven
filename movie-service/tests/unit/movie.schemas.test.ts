import { createMovieSchema } from "../../src/modules/movies/movie.schemas";

describe("movie schema", () => {
  it("parses a valid create payload", () => {
    const payload = createMovieSchema.parse({
      title: "Interstellar",
      description: "Space exploration",
      durationMinutes: 169,
      posterUrl: "https://example.com/poster.jpg",
    });

    expect(payload.title).toBe("Interstellar");
    expect(payload.durationMinutes).toBe(169);
  });

  it("rejects invalid create payload", () => {
    expect(() =>
      createMovieSchema.parse({
        title: "",
        durationMinutes: 0,
      }),
    ).toThrow();
  });
});
