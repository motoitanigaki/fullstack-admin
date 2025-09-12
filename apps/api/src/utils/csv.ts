import type { Context } from "hono";

/**
 * RFC 4180-ish CSV escaping.
 * - null/undefined -> empty
 * - Date -> ISO string
 * - Quote fields containing [",\n,\r]
 */
export function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return `"${v.toISOString()}"`;
  const s = typeof v === "string" ? v : String(v);
  const needsQuote = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export function csvResponse(
  c: Context,
  filename: string,
  body: string
): Response {
  return c.newResponse(body, 200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  });
}
