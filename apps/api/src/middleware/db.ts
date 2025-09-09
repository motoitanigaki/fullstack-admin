import { getDb } from "@packages/schema";
import { factory } from "../types/env";

export const dbMiddleware = factory.createMiddleware(async (c, next) => {
  const db = getDb(c.env.HYPERDRIVE.connectionString);
  c.set("db", db);
  await next();
});
