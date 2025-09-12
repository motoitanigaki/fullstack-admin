import type { CrudFilters } from "@refinedev/core";
import { generateFilter } from "@refinedev/simple-rest";
import { FILTERS, type FilterDraft } from "./filters";

// Convert Refine CrudFilters to URLSearchParams using the
// same mapping logic as @refinedev/simple-rest.
export function filtersToSearchParams(crud: CrudFilters): URLSearchParams {
  const obj = generateFilter(crud);
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, String(v));
    } else {
      qs.set(key, typeof value === "string" ? value : String(value));
    }
  }
  return qs;
}

// Convert applied filter drafts (UI state) to Refine CrudFilters
export function draftsToCrudFilters(
  applied: Record<string, FilterDraft>,
): CrudFilters {
  return Object.entries(applied).flatMap(([field, d]) =>
    FILTERS[d.type].toCrudFilters(field, d),
  );
}
