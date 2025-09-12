import type { Tag } from "@packages/types";
import { useDelete, useNavigation } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import {
  LinkCell,
  ResourceTable,
  type TableAction,
} from "@/components/resource-table";

const columnHelper = createColumnHelper<Tag>();

export const TagList = () => {
  const { edit, create } = useNavigation();
  const { mutate: deleteTag } = useDelete();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("id", { enableSorting: false }),
      columnHelper.accessor("name", {
        enableSorting: true,
        meta: { filter: { type: "textContains" }, label: "Name" },
        cell: ({ row, getValue }) => (
          <LinkCell to={`/tags/edit/${row.original.id}`}>
            {getValue<string>()}
          </LinkCell>
        ),
      }),
    ],
    [],
  );

  const handleDelete = (record: Tag) => {
    if (window.confirm("Are you sure?")) {
      deleteTag({ resource: "tags", id: record.id });
    }
  };

  const actions: TableAction<Tag>[] = [
    { label: "Edit", onClick: (record) => edit("tags", record.id) },
    { label: "Delete", onClick: handleDelete, variant: "danger" },
  ];

  return (
    <ResourceTable
      resource="tags"
      columns={columns}
      onCreateClick={() => create("tags")}
      actions={actions}
    />
  );
};
