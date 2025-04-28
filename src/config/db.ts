import { MikroORM } from "@mikro-orm/postgresql";
import config from "../utils/mikro-orm.config";

async function initORM() {
  const orm = await MikroORM.init(config);
  return orm;
}

export const db = initORM();
