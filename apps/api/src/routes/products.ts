import { vValidator } from "@hono/valibot-validator";
import {
  categoryTable,
  productInsertSchema,
  productTable,
  productTagTable,
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
            column: productTable.id,
            type: "number",
            sort: true,
            filters: ["eq"],
          },
          categoryId: {
            column: productTable.categoryId,
            type: "number",
            sort: true,
            filters: ["eq"],
          },
          name: {
            column: productTable.name,
            type: "string",
            sort: true,
            filters: ["like"],
          },
          status: {
            column: productTable.status,
            type: "string",
            sort: true,
            filters: ["like", "eq"],
          },
          price: {
            column: productTable.price,
            type: "number",
            sort: true,
            filters: ["gte", "lte"],
          },
          stock: {
            column: productTable.stock,
            type: "number",
            sort: true,
            filters: ["gte", "lte"],
          },
          availableAt: {
            column: productTable.availableAt,
            type: "date",
            sort: true,
            filters: ["gte", "lte"],
          },
          createdAt: {
            column: productTable.createdAt,
            type: "date",
            sort: true,
          },
          updatedAt: {
            column: productTable.updatedAt,
            type: "date",
            sort: true,
          },
        },
        defaultSort: [{ field: "id", order: "asc" }],
      }
    );

    const base = db
      .select({
        ...getTableColumns(productTable),
        category: {
          id: categoryTable.id,
          name: categoryTable.name,
        },
      })
      .from(productTable)
      .innerJoin(categoryTable, eq(productTable.categoryId, categoryTable.id));

    const totalPromise = db
      .select({ count: count() })
      .from(productTable)
      .where(where);

    const productsPromise = (where ? base.where(where) : base)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [total, products] = await Promise.all([
      totalPromise,
      productsPromise,
    ]);

    setTotalHeaders(c, total[0]?.count ?? 0);
    return c.json(successResponse(products));
  })

  .get("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const product = await db.query.productTable.findFirst({
      where: and(eq(productTable.id, id)),
      with: {
        category: true,
        productTags: { with: { tag: true } },
      },
    });

    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    const { productTags, category, ...productData } = product;
    return c.json(
      successResponse({
        ...productData,
        category,
        tagIds: productTags.map((pt) => pt.tag.id),
        tags: productTags.map((pt) => ({
          id: pt.tag.id,
          name: pt.tag.name,
        })),
      })
    );
  })

  .post("/", vValidator("json", productInsertSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const { tagIds, ...productData } = data;
    const [product] = await db
      .insert(productTable)
      .values(productData)
      .returning();

    if (tagIds && tagIds.length > 0) {
      await db
        .insert(productTagTable)
        .values(
          tagIds.map((tagId: number) => ({ productId: product.id, tagId }))
        );
    }

    return c.json(successResponse(product), 201);
  })

  .patch("/:id", vValidator("json", productUpdateSchema), async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const data = c.req.valid("json");
    const db = c.get("db");

    const { tagIds, ...productData } = data;
    const [product] = await db
      .update(productTable)
      .set(productData)
      .where(eq(productTable.id, id))
      .returning();

    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    if (tagIds !== undefined) {
      await db.delete(productTagTable).where(eq(productTagTable.productId, id));

      if (tagIds.length > 0) {
        await db
          .insert(productTagTable)
          .values(tagIds.map((tagId: number) => ({ productId: id, tagId })));
      }
    }

    return c.json(successResponse(product));
  })

  .delete("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const [product] = await db
      .delete(productTable)
      .where(eq(productTable.id, id))
      .returning();

    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    return c.body(null, 204);
  });

export default app;
