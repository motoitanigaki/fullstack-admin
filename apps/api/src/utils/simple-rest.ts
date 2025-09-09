import {
  type AnyColumn,
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  ne,
  type SQL,
} from "drizzle-orm";

type FieldType = "string" | "number" | "date" | "uuid" | "boolean";

type FilterOp = "eq" | "ne" | "like" | "gte" | "lte";

export type FieldSpec = {
  column: AnyColumn;
  type: FieldType;
  sort?: boolean;
  filters?: FilterOp[];
};

export type SimpleRestConfig = {
  fields: Record<string, FieldSpec>;
  defaultSort?: { field: string; order?: "asc" | "desc" }[];
};

const RESERVED = new Set([
  "_start",
  "_end",
  "_sort",
  "_order",
  "_page",
  "_limit",
]);

const parseValue = (raw: string, type: FieldType) => {
  switch (type) {
    case "number": {
      const n = Number(raw);
      return Number.isNaN(n) ? undefined : n;
    }
    case "boolean":
      return raw === "true" ? true : raw === "false" ? false : undefined;
    case "date": {
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
    default:
      return raw;
  }
};

const splitFieldAndOp = (key: string) => {
  const idx = key.lastIndexOf("_");
  if (idx <= 0)
    return {
      field: key,
      op: undefined as undefined | "gte" | "lte" | "like" | "ne" | "eq",
    };
  const maybe = key.slice(idx + 1);
  if (["gte", "lte", "like", "ne", "eq"].includes(maybe)) {
    return {
      field: key.slice(0, idx),
      op: maybe as "gte" | "lte" | "like" | "ne" | "eq",
    };
  }
  return { field: key, op: undefined };
};

export function parseSimpleRest(
  search: URLSearchParams,
  config: SimpleRestConfig,
  extraWheres: SQL<unknown>[] = [],
) {
  const startStr = search.get("_start");
  const endStr = search.get("_end");
  const pageStr = search.get("_page");
  const limitStr = search.get("_limit");

  const start = startStr ? Number(startStr) : undefined;
  const end = endStr ? Number(endStr) : undefined;
  const page = pageStr ? Number(pageStr) : undefined;
  const limitParam = limitStr ? Number(limitStr) : undefined;

  const offset =
    start !== undefined && Number.isFinite(start) && start >= 0
      ? start
      : page && limitParam
        ? Math.max(0, (page - 1) * limitParam)
        : 0;
  const limit =
    end !== undefined && start !== undefined
      ? Math.max(0, end - start)
      : limitParam && Number.isFinite(limitParam)
        ? Math.max(0, limitParam)
        : 50;

  const sorts = (search.get("_sort") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const orders = (search.get("_order") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const orderBy: SQL<unknown>[] = [];
  if (sorts.length) {
    sorts.forEach((f, i) => {
      const spec = config.fields[f];
      if (!spec || spec.sort === false) return;
      const dir = (orders[i] ?? orders[0] ?? "asc") === "desc" ? "desc" : "asc";
      orderBy.push(dir === "desc" ? desc(spec.column) : asc(spec.column));
    });
  } else if (config.defaultSort?.length) {
    for (const { field, order } of config.defaultSort) {
      const spec = config.fields[field];
      if (!spec) continue;
      orderBy.push(order === "asc" ? asc(spec.column) : desc(spec.column));
    }
  }

  const wheres: SQL<unknown>[] = [...extraWheres];

  const isAllowed = (spec: FieldSpec, op: FilterOp): boolean => {
    if (!spec.filters) return false; // when omitted, disallow filtering
    return spec.filters.includes(op);
  };
  for (const [key, raw] of search.entries()) {
    if (RESERVED.has(key)) continue;
    const { field, op } = splitFieldAndOp(key);
    const spec = config.fields[field];
    if (!spec) continue;

    const _values = raw.includes(",") ? raw.split(",") : [raw];

    // Note: unsupported operators (in, isnull, gt, lt, startswith, ilike) are ignored

    const val = parseValue(raw, spec.type);
    if (val === undefined) continue;

    if (!op) {
      // Default behavior when operator is omitted: exact match
      if (isAllowed(spec, "eq")) {
        wheres.push(eq(spec.column, val));
      }
      continue;
    }

    switch (op) {
      case "eq":
        if (isAllowed(spec, "eq")) wheres.push(eq(spec.column, val));
        break;
      case "ne":
        if (isAllowed(spec, "ne")) wheres.push(ne(spec.column, val));
        break;
      case "like":
        if (isAllowed(spec, "like"))
          wheres.push(ilike(spec.column, `%${String(val)}%`));
        break;
      case "gte":
        if (isAllowed(spec, "gte")) wheres.push(gte(spec.column, val));
        break;
      case "lte":
        if (isAllowed(spec, "lte")) wheres.push(lte(spec.column, val));
        break;
      default:
        break;
    }
  }

  return {
    where: wheres.length ? (and(...wheres) as SQL<unknown>) : undefined,
    orderBy,
    limit,
    offset,
  };
}
