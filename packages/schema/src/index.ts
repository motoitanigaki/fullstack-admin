import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./models";

export const getDb = (connectionString: string) => {
  return drizzle(postgres(connectionString), { schema });
};

export * from "./models";
export * from "./validations";
