import type { Category } from "@packages/types";
import { useDelete, useNavigation } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import {
  DateTimeCell,
  ResourceTable,
  type TableAction,
} from "@/components/resource-table";

const columnHelper = createColumnHelper<Category>();

export const CategoryList = () => {
  const { edit, create } = useNavigation();
  const { mutate: deleteCategory } = useDelete();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("id", { enableSorting: false }),
      columnHelper.accessor("name", {
        enableSorting: true,
        meta: { filter: { type: "textContains" }, label: "Name" },
      }),
      columnHelper.accessor("isActive", {
        enableSorting: true,
        meta: {
          filter: {
            type: "selectEquals",
            options: [
              { value: "true", label: "True" },
              { value: "false", label: "False" },
            ],
          },
          label: "Active",
        },
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
    [],
  );

  const handleDelete = (record: Category) => {
    if (window.confirm("Are you sure?")) {
      deleteCategory({ resource: "categories", id: record.id });
    }
  };

  const actions: TableAction<Category>[] = [
    { label: "Edit", onClick: (record) => edit("categories", record.id) },
    { label: "Delete", onClick: handleDelete, variant: "danger" },
  ];

  return (
    <ResourceTable
      resource="categories"
      columns={columns}
      onCreateClick={() => create("categories")}
      actions={actions}
    />
  );
};
