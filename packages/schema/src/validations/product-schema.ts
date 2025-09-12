import { status } from "@packages/constants";
import * as v from "valibot";

const availableAtSchema = v.union([
  v.null(),
  v.pipe(
    v.string(),
    v.isoTimestamp("Invalid availableAt"),
    v.transform((s) => new Date(s)),
  ),
]);

export const productInsertSchema = v.object({
  categoryId: v.pipe(v.number(), v.integer("Category ID must be an integer")),
  name: v.pipe(v.string(), v.nonEmpty("Name is required")),
  price: v.pipe(
    v.union([v.number(), v.string()]),
    v.transform((v) => String(v)),
  ),
  description: v.optional(v.string()),
  stock: v.optional(v.pipe(v.number(), v.integer("Stock must be an integer"))),
  status: v.optional(v.picklist(status)),
  availableAt: v.optional(availableAtSchema),
  tagIds: v.optional(
    v.array(v.pipe(v.number(), v.integer("Tag ID must be an integer"))),
  ),
});

export const productUpdateSchema = v.object({
  categoryId: v.optional(
    v.pipe(v.number(), v.integer("Category ID must be an integer")),
  ),
  name: v.optional(v.pipe(v.string(), v.nonEmpty("Name is required"))),
  price: v.optional(
    v.pipe(
      v.union([v.number(), v.string()]),
      v.transform((v) => String(v)),
    ),
  ),
  description: v.optional(v.string()),
  stock: v.optional(v.pipe(v.number(), v.integer("Stock must be an integer"))),
  status: v.optional(v.picklist(status)),
  availableAt: v.optional(availableAtSchema),
  tagIds: v.optional(
    v.array(v.pipe(v.number(), v.integer("Tag ID must be an integer"))),
  ),
});
