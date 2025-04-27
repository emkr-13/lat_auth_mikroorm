import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity()
@Unique({ properties: ["username"] })
export class User {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property({ length: 50 })
  username!: string;

  @Property({ length: 255 })
  password!: string;

  @Property({ nullable: true, length: 255 })
  refreshToken?: string;

  @Property({ nullable: true })
  refreshTokenExp?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;
}