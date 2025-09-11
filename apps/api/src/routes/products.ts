import { vValidator } from "@hono/valibot-validator";
import {
  categories,
  productInsertSchema,
  products,
  productUpdateSchema,
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
            column: products.id,
            type: "number",
            sort: true,
            filters: ["eq"],
          },
          categoryId: {
            column: products.categoryId,
            type: "number",
            sort: true,
            filters: ["eq"],
          },
          name: {
            column: products.name,
            type: "string",
            sort: true,
            filters: ["like"],
          },
          status: {
            column: products.status,
            type: "string",
            sort: true,
            filters: ["like", "eq"],
          },
          price: {
            column: products.price,
            type: "number",
            sort: true,
            filters: ["gte", "lte"],
          },
          stock: {
            column: products.stock,
            type: "number",
            sort: true,
            filters: ["gte", "lte"],
          },
          availableAt: {
            column: products.availableAt,
            type: "date",
            sort: true,
            filters: ["gte", "lte"],
          },
          createdAt: { column: products.createdAt, type: "date", sort: true },
          updatedAt: { column: products.updatedAt, type: "date", sort: true },
        },
        defaultSort: [{ field: "id", order: "asc" }],
      },
    );

    const base = db
      .select({
        ...getTableColumns(products),
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id));

    const totalPromise = db
      .select({ count: count() })
      .from(products)
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

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id)),
      with: { category: true },
    });

    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    return c.json(successResponse(product));
  })

  .post("/", vValidator("json", productInsertSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const [item] = await db
      .insert(products)
      .values({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        status: data.status,
        availableAt: data.availableAt,
      })
      .returning();

    return c.json(successResponse(item), 201);
  })

  .patch("/:id", vValidator("json", productUpdateSchema), async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const data = c.req.valid("json");
    const db = c.get("db");

    const [item] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();

    if (!item) {
      throw new HTTPException(404, { message: "Product not found" });
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
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!item) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    return c.body(null, 204);
  });

export default app;
