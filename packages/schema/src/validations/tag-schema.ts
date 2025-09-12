import * as v from "valibot";

export const tagInsertSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Name is required")),
});

export const tagUpdateSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.nonEmpty("Name is required"))),
});
