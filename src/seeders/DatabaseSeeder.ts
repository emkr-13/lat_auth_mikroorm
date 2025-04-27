import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from "../models/user";
import bcrypt from "bcryptjs";

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    em.create(User, {
      username: "admin",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

}
