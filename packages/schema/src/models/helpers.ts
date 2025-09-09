import * as t from "drizzle-orm/pg-core";

export const createdAt = () =>
  t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const updatedAt = () =>
  t
    .timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date());
