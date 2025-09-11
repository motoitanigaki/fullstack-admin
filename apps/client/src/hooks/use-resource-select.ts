import { useSelect } from "@refinedev/core";

export function useCategorySelect() {
  return useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    filters: [{ field: "isActive", operator: "eq", value: true }],
    sorters: [{ field: "updatedAt", order: "desc" }],
    pagination: { pageSize: 50 },
    onSearch: (value: string) =>
      value
        ? [
            {
              field: "name",
              operator: "contains",
              value,
            },
          ]
        : [],
  });
}
