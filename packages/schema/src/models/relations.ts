import { relations } from "drizzle-orm";
import {
  categoryTable,
  productTable,
  productTagTable,
  tagTable,
} from "./tables";

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(productTable),
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
  productTags: many(productTagTable),
}));

export const tagRelations = relations(tagTable, ({ many }) => ({
  productTags: many(productTagTable),
}));

export const productTagRelations = relations(productTagTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productTagTable.productId],
    references: [productTable.id],
  }),
  tag: one(tagTable, {
    fields: [productTagTable.tagId],
    references: [tagTable.id],
  }),
}));
