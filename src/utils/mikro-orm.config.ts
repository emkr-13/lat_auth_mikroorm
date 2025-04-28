import { defineConfig } from "@mikro-orm/postgresql";
import { User } from "../models/user";
import "dotenv/config"; // Sesuaikan path

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  debug: true,
  entities: [User],
  migrations: {
    path: "./dist/migrations",
    pathTs: "./src/migrations",
  },
  seeder: {
    path: "./dist/seeders",
    pathTs: "./src/seeders",
  },
});
