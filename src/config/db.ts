import { MikroORM } from "@mikro-orm/postgresql";
import config from "mikro-orm.config";

async function initORM() {
  const orm = await MikroORM.init(config);
  return orm;
}

export const db = initORM();
