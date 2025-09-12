import { vValidator } from "@hono/valibot-validator";
import {
  categoryInsertSchema,
  categoryTable,
  categoryUpdateSchema,
} from "@packages/schema";
import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { factory } from "../types/env";
import { csvEscape, csvResponse } from "../utils/csv";
import { setTotalHeaders, successResponse } from "../utils/response";
import { parseSimpleRest, type SimpleRestConfig } from "../utils/simple-rest";

const categoryRestConfig: SimpleRestConfig = {
  fields: {
    id: {
      column: categoryTable.id,
      type: "number",
      sort: true,
      filters: ["eq"],
    },
    name: {
      column: categoryTable.name,
      type: "string",
      sort: true,
      filters: ["like"],
    },
    isActive: {
      column: categoryTable.isActive,
      type: "boolean",
      sort: true,
      filters: ["eq"],
    },
    createdAt: {
      column: categoryTable.createdAt,
      type: "date",
      sort: true,
    },
    updatedAt: {
      column: categoryTable.updatedAt,
      type: "date",
      sort: true,
    },
  },
  defaultSort: [{ field: "id", order: "asc" }],
};

const app = factory
  .createApp()
  .get("/", async (c) => {
    const db = c.get("db");
    const url = new URL(c.req.url);

    const { where, orderBy, limit, offset } = parseSimpleRest(
      url.searchParams,
      categoryRestConfig,
    );

    const base = db
      .select({
        ...getTableColumns(categoryTable),
      })
      .from(categoryTable);

    const totalPromise = db
      .select({ count: count() })
      .from(categoryTable)
      .where(where);

    const categoriesPromise = (where ? base.where(where) : base)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [total, categories] = await Promise.all([
      totalPromise,
      categoriesPromise,
    ]);

    setTotalHeaders(c, total[0]?.count ?? 0);
    return c.json(successResponse(categories));
  })

  .get("/export", async (c) => {
    const db = c.get("db");
    const url = new URL(c.req.url);

    const { where } = parseSimpleRest(url.searchParams, categoryRestConfig);

    const colsRec = getTableColumns(categoryTable);
    const columns = Object.keys(colsRec);
    const maxRows = 1000;
    // TODO: Large exports should fall back to background job + R2 artifact
    const baseQuery = db.select({ ...colsRec }).from(categoryTable);
    const rows = await (where ? baseQuery.where(where) : baseQuery)
      .orderBy(asc(categoryTable.id))
      .limit(maxRows);

    type ColKey = keyof typeof colsRec;
    const colKeys = columns as ColKey[];
    const header = `${columns.join(",")}\n`;
    const body = `${rows
      .map((r) => colKeys.map((k) => csvEscape(r[k])).join(","))
      .join("\n")}\n`;
    const csv = header + body;
    const filename = `categories-${new Date().toISOString().slice(0, 10)}.csv`;
    return csvResponse(c, filename, csv);
  })

  .get("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const category = await db.query.categoryTable.findFirst({
      where: and(eq(categoryTable.id, id)),
    });

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return c.json(successResponse(category));
  })

  .post("/", vValidator("json", categoryInsertSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const [category] = await db.insert(categoryTable).values(data).returning();

    return c.json(successResponse(category), 201);
  })

  .patch("/:id", vValidator("json", categoryUpdateSchema), async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const data = c.req.valid("json");
    const db = c.get("db");

    const [category] = await db
      .update(categoryTable)
      .set(data)
      .where(eq(categoryTable.id, id))
      .returning();

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return c.json(successResponse(category));
  })

  .delete("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const [category] = await db
      .delete(categoryTable)
      .where(eq(categoryTable.id, id))
      .returning();

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return c.body(null, 204);
  });

export default app;
