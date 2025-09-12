import { vValidator } from "@hono/valibot-validator";
import { tagInsertSchema, tagTable, tagUpdateSchema } from "@packages/schema";
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
            column: tagTable.id,
            type: "number",
            sort: true,
            filters: ["eq"],
          },
          name: {
            column: tagTable.name,
            type: "string",
            sort: true,
            filters: ["like"],
          },
        },
        defaultSort: [{ field: "id", order: "asc" }],
      }
    );

    const base = db.select({ ...getTableColumns(tagTable) }).from(tagTable);

    const totalPromise = db
      .select({ count: count() })
      .from(tagTable)
      .where(where);

    const tagsPromise = (where ? base.where(where) : base)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [total, tags] = await Promise.all([totalPromise, tagsPromise]);

    setTotalHeaders(c, total[0]?.count ?? 0);
    return c.json(successResponse(tags));
  })

  .get("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const tag = await db.query.tagTable.findFirst({
      where: and(eq(tagTable.id, id)),
    });

    if (!tag) {
      throw new HTTPException(404, { message: "Tag not found" });
    }

    return c.json(successResponse(tag));
  })

  .post("/", vValidator("json", tagInsertSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const [tab] = await db.insert(tagTable).values(data).returning();
    return c.json(successResponse(tab), 201);
  })

  .patch("/:id", vValidator("json", tagUpdateSchema), async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const data = c.req.valid("json");
    const db = c.get("db");

    const [tag] = await db
      .update(tagTable)
      .set(data)
      .where(eq(tagTable.id, id))
      .returning();

    if (!tag) {
      throw new HTTPException(404, { message: "Tag not found" });
    }

    return c.json(successResponse(tag));
  })

  .delete("/:id", async (c) => {
    const idStr = c.req.param("id");
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      throw new HTTPException(400, { message: "Invalid ID" });
    }

    const db = c.get("db");

    const [tag] = await db
      .delete(tagTable)
      .where(eq(tagTable.id, id))
      .returning();

    if (!tag) {
      throw new HTTPException(404, { message: "Tag not found" });
    }

    return c.body(null, 204);
  });

export default app;
