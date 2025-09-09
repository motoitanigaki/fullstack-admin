import type { categories, products, statusEnum } from "@packages/schema";

export type Status = (typeof statusEnum.enumValues)[number];
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
