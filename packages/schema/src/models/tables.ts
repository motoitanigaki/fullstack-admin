import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { statusEnum } from "./enums";
import { createdAt, updatedAt } from "./helpers";

export const categories = table(
  "categories",
  {
    id: t.serial("id").primaryKey(),
    name: t.text("name").notNull(),
    isActive: t.boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [t.index("idx_categories_name").on(table.name)],
);

export const products = table(
  "products",
  {
    id: t.serial("id").primaryKey(),
    categoryId: t
      .integer("category_id")
      .notNull()
      .references(() => categories.id),
    name: t.text("name").notNull(),
    description: t.text("description"),
    price: t.numeric("price").notNull(),
    stock: t.integer("stock").notNull().default(0),
    status: statusEnum("status").notNull().default("draft"),
    availableAt: t.timestamp("available_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    t.index("idx_products_category").on(table.categoryId),
    t.index("idx_products_status").on(table.status),
  ],
);
