import type {
  categories,
  products,
  productTags,
  statusEnum,
  tags,
} from "@packages/schema";

export type Status = (typeof statusEnum.enumValues)[number];
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type ProductTag = typeof productTags.$inferSelect;
