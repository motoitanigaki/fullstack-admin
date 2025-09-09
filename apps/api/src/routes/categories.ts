import { vValidator } from "@hono/valibot-validator";
import {
  categories,
  categoryInsertSchema,
  categoryUpdateSchema,
} from "@packages/schema";
import { and, count, eq, getTableColumns } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { factory } from "../types/env";
import { setTotalHeaders, successResponse } from "../utils/response";
import { parseSimpleRest } from "../utils/simple-rest";

const app = factory
  .createApp()
  .get("/", async (c) => {
    const db = c.get("db");
    const url = new URL(c.req.url);

    const { where, orderBy, limit, offset } = parseSimpleRest(
      url.searchParams,
      {
        fields: {
          id: {
            column: categories.id,
            type: "number",
            sort: true,
            filters: ["eq"],
          },
          name: {
            column: categories.name,
            type: "string",
            sort: true,
            filters: ["like"],
          },
          isActive: {
            column: categories.isActive,
            type: "boolean",
            sort: true,
            filters: ["eq"],
          },
          createdAt: {
            column: categories.createdAt,
            type: "date",
            sort: true,
          },
          updatedAt: {
            column: categories.updatedAt,
            type: "date",
            sort: true,
          },
        },
        defaultSort: [{ field: "id", order: "asc" }],
      },
    );

    const base = db
      .select({
        ...getTableColumns(categories),
      })
      .from(categories);

    const totalPromise = db
      .select({ count: count() })
      .from(categories)
      .where(where);

    const itemsPromise = (where ? base.where(where) : base)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [total, items] = await Promise.all([totalPromise, itemsPromise]);

    setTotalHeaders(c, total[0]?.count ?? 0);
    return c.json(successResponse(items));
  })

  .get("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const category = await db.query.categories.findFirst({
      where: and(eq(categories.id, id)),
    });

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return c.json(successResponse(category));
  })

  .post("/", vValidator("json", categoryInsertSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const [item] = await db
      .insert(categories)
      .values({
        name: data.name,
        isActive: data.isActive ?? true,
      })
      .returning();

    return c.json(successResponse(item), 201);
  })

  .patch("/:id", vValidator("json", categoryUpdateSchema), async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const data = c.req.valid("json");
    const db = c.get("db");

    const [item] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();

    if (!item) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return c.json(successResponse(item));
  })

  .delete("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const [item] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!item) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return c.body(null, 204);
  });

export default app;
