const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const movies = [
    {
      title: "Inception",
      description: "A mind-bending science fiction thriller.",
      durationMinutes: 148,
      posterUrl: "https://example.com/inception.jpg",
    },
    {
      title: "Interstellar",
      description: "Explorers travel through a wormhole in space.",
      durationMinutes: 169,
      posterUrl: "https://example.com/interstellar.jpg",
    },
    {
      title: "The Dark Knight",
      description: "Batman faces the Joker in Gotham City.",
      durationMinutes: 152,
      posterUrl: "https://example.com/dark-knight.jpg",
    },
  ];

  for (const movie of movies) {
    await prisma.movie.create({
      data: movie,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
