import type {
  categoryTable,
  productTable,
  productTagTable,
  statusEnum,
  tagTable,
} from "@packages/schema";

export type Status = (typeof statusEnum.enumValues)[number];
export type Category = typeof categoryTable.$inferSelect;
export type Product = typeof productTable.$inferSelect;
export type Tag = typeof tagTable.$inferSelect;
export type ProductTag = typeof productTagTable.$inferSelect;
