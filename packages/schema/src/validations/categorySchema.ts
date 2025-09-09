import * as v from "valibot";

export const categoryInsertSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Name is required")),
  isActive: v.optional(v.boolean()),
});

export const categoryUpdateSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty("Name is required"))),
  isActive: v.optional(v.boolean()),
});
