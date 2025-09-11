import { status as statusList } from "@packages/constants";
import type { Product } from "@packages/types";
import { useDelete, useNavigation, useSelect } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import {
  DateTimeCell,
  LinkCell,
  ResourceTable,
  type TableAction,
} from "@/components/resource-table";

type ProductWithCategory = Product & { category: { id: number; name: string } };
const columnHelper = createColumnHelper<ProductWithCategory>();

export const ProductList = () => {
  const { edit, create } = useNavigation();
  const { mutate: deleteProduct } = useDelete();
  const categories = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    filters: [{ field: "isActive", operator: "eq", value: true }],
    sorters: [{ field: "updatedAt", order: "desc" }],
    pagination: { pageSize: 10 },
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

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("id", { enableSorting: false }),
      columnHelper.accessor("name", {
        enableSorting: true,
        meta: { filter: { type: "textContains" }, label: "Name" },
      }),
      columnHelper.accessor("category.name", {
        id: "categoryId",
        enableSorting: true,
        meta: {
          label: "Category",
          filter: {
            type: "selectEquals",
            options: categories.options,
            onSearch: categories.onSearch,
          },
        },
        cell: ({ row, getValue }) => (
          <LinkCell to={`/categories/edit/${row.original.category.id}`}>
            {getValue<string>()}
          </LinkCell>
        ),
      }),
      columnHelper.accessor("price", {
        enableSorting: true,
        meta: { filter: { type: "numberRange" }, label: "Price" },
      }),
      columnHelper.accessor("stock", {
        enableSorting: true,
        meta: { filter: { type: "numberRange" }, label: "Stock" },
      }),
      columnHelper.accessor("status", {
        enableSorting: true,
        meta: {
          filter: {
            type: "selectEquals",
            options: statusList.map((s) => ({ value: s, label: s })),
          },
          label: "Status",
        },
      }),
      columnHelper.accessor("availableAt", {
        enableSorting: true,
        meta: { filter: { type: "dateTimeRange" }, label: "Available At" },
        cell: ({ getValue }) => <DateTimeCell value={getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        enableSorting: true,
        meta: { label: "Created At" },
        cell: ({ getValue }) => <DateTimeCell value={getValue()} />,
      }),
      columnHelper.accessor("updatedAt", {
        enableSorting: true,
        meta: { label: "Updated At" },
        cell: ({ getValue }) => <DateTimeCell value={getValue()} />,
      }),
      columnHelper.display({ id: "actions", header: "", enableSorting: false }),
    ],
    [categories.options, categories.onSearch],
  );

  const handleDelete = (record: Product) => {
    if (window.confirm("Are you sure?")) {
      deleteProduct({ resource: "products", id: record.id });
    }
  };

  const actions: TableAction<ProductWithCategory>[] = [
    { label: "Edit", onClick: (record) => edit("products", record.id) },
    { label: "Delete", onClick: handleDelete, variant: "danger" },
  ];

  return (
    <ResourceTable
      resource="products"
      columns={columns}
      onCreateClick={() => create("products")}
      actions={actions}
    />
  );
};
