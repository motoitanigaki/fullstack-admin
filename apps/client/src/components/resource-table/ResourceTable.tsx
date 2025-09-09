import type { BaseRecord, CrudFilters } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Filter,
  MoreVertical,
} from "lucide-react";
import React from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@/components/ui/table";
import {
  FILTERS,
  type FilterDraft,
  type FilterType,
  type Option,
} from "./filters";
import { ResourceTableFilterBadges } from "./ResourceTableFilterBadges";
import { ResourceTableFilterContent } from "./ResourceTableFilterContent";
import { ResourceTablePagination } from "./ResourceTablePagination";
import { ResourceTableViewOptions } from "./ResourceTableViewOptions";

export interface TableAction<TData extends BaseRecord = BaseRecord> {
  label: string;
  onClick: (record: TData) => void;
  variant?: "primary" | "secondary" | "danger";
}

interface ColumnFilterMeta {
  filter?: {
    type: FilterType;
    label?: string;
    options?: Option[];
    onSearch?: (term: string) => void;
  };
}
type ColumnMeta = ColumnFilterMeta & {
  label?: string;
  labelKey?: string;
  noAutoHeader?: boolean;
};

interface ResourceTableProps<TData extends BaseRecord = BaseRecord> {
  columns: ColumnDef<TData, any>[];
  resource: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  actions?: TableAction<TData>[];
}

const toCrudFilters = (applied: Record<string, FilterDraft>): CrudFilters =>
  Object.entries(applied).flatMap(([field, d]) =>
    FILTERS[d.type].toCrudFilters(field, d),
  );

export function ResourceTable<TData extends BaseRecord = BaseRecord>({
  resource,
  columns,
  onCreateClick,
  showCreateButton = true,
  actions = [],
}: ResourceTableProps<TData>) {
  // Auto-complete header titles when header is not provided.
  // Fallback order: meta.label > `id`.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keep columns stable
  const normalizedColumns = React.useMemo<ColumnDef<TData, any>[]>(() => {
    const getId = (col: ColumnDef<TData, any>) => {
      const maybe: any = col;
      return (
        (typeof maybe.id === "string" && maybe.id) ||
        (typeof maybe.accessorKey === "string" && maybe.accessorKey) ||
        undefined
      );
    };

    return columns.map((col) => {
      const id = getId(col);
      const meta = (col.meta as ColumnMeta | undefined) ?? undefined;
      if (!id || meta?.noAutoHeader) return col;

      const header = col.header as unknown;
      const hasExplicit =
        header !== undefined && !(typeof header === "string" && header === id);
      if (hasExplicit) return col;

      if (id === "actions") {
        return { ...col, header: () => null } as ColumnDef<TData, any>;
      }

      if (meta?.label) {
        return { ...col, header: meta.label } as ColumnDef<TData, any>;
      }

      return col;
    });
  }, [columns, resource]);

  const [filterDrafts, setFilterDrafts] = React.useState<
    Record<string, FilterDraft>
  >({});
  const [appliedFilters, setAppliedFilters] = React.useState<
    Record<string, FilterDraft>
  >({});
  const [openFilterFor, setOpenFilterFor] = React.useState<string | null>(null);

  const table = useTable<TData>({
    columns: normalizedColumns,
    refineCoreProps: {
      pagination: { pageSize: 50 },
      resource,
    },
  });

  const { reactTable, refineCore } = table;
  const {
    getHeaderGroups,
    getRowModel,
    getState,
    setPageIndex,
    getCanPreviousPage,
    getPageCount,
    getCanNextPage,
    nextPage,
    previousPage,
    setPageSize,
  } = reactTable;
  const {
    tableQuery: { data: tableData, isLoading },
  } = refineCore;

  const applyColumnFilter = React.useCallback(
    (colId: string) => {
      const draft = filterDrafts[colId];
      const nextApplied = { ...appliedFilters };
      if (!draft || FILTERS[draft.type].isEmpty(draft))
        delete nextApplied[colId];
      else nextApplied[colId] = draft as FilterDraft;

      setAppliedFilters(nextApplied);
      const crud = toCrudFilters(nextApplied);
      refineCore.setFilters(crud, "replace");
      setPageIndex(0);
    },
    [appliedFilters, filterDrafts, setPageIndex, refineCore],
  );

  const clearColumnFilter = React.useCallback(
    (colId: string) => {
      const nextApplied = { ...appliedFilters };
      delete nextApplied[colId];
      setAppliedFilters(nextApplied);
      setFilterDrafts((prev) => {
        const n = { ...prev };
        delete n[colId];
        return n;
      });
      const crud = toCrudFilters(nextApplied);
      refineCore.setFilters(crud, "replace");
      setPageIndex(0);
    },
    [appliedFilters, setPageIndex, refineCore],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Breadcrumb />
        </div>
        <div className="flex items-center gap-2">
          <ResourceTableViewOptions
            table={reactTable}
            columnLabels={reactTable
              .getAllLeafColumns()
              .reduce<Record<string, string>>((acc, c) => {
                const id = String(c.id);
                const meta =
                  (c.columnDef.meta as ColumnMeta | undefined) ?? undefined;
                const headerVal = c.columnDef.header as unknown;
                const headerStr =
                  typeof headerVal === "string" ? headerVal : undefined;
                acc[id] = meta?.label ?? headerStr ?? id;
                return acc;
              }, {})}
          />
          {showCreateButton && onCreateClick && (
            <Button type="button" onClick={onCreateClick}>
              {"Create"}
            </Button>
          )}
        </div>
      </div>

      <ResourceTableFilterBadges
        applied={appliedFilters}
        onClear={clearColumnFilter}
        columnLabels={reactTable
          .getAllLeafColumns()
          .reduce<Record<string, string>>((acc, c) => {
            const id = String(c.id);
            const meta =
              (c.columnDef.meta as ColumnMeta | undefined) ?? undefined;
            const headerVal = c.columnDef.header as unknown;
            const headerStr =
              typeof headerVal === "string" ? headerVal : undefined;
            acc[id] = meta?.label ?? headerStr ?? id;
            return acc;
          }, {})}
      />

      <div className="overflow-x-auto">
        <UITable className="min-w-full">
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  const meta =
                    (header.column.columnDef.meta as
                      | ColumnFilterMeta
                      | undefined) || undefined;
                  const filterType = meta?.filter?.type;
                  const colId = header.column.id;
                  const draft = filterDrafts[colId];
                  const isSortApplied = Boolean(sortDirection);

                  const metaLabel = (meta as { label?: string })?.label;
                  const computedHeader = metaLabel ?? colId;

                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap"
                      colSpan={header.colSpan as number}
                    >
                      {!header.isPlaceholder &&
                        (canSort ? (
                          <div className="group flex items-center gap-1">
                            <span className="select-none">
                              {header.column.columnDef.header !== undefined
                                ? flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )
                                : computedHeader}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={
                                isSortApplied
                                  ? "h-6 w-6"
                                  : "h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </Button>
                            {filterType && (
                              <Popover
                                open={openFilterFor === colId}
                                onOpenChange={(open) =>
                                  setOpenFilterFor(open ? colId : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() =>
                                      setOpenFilterFor((prev) =>
                                        prev === colId ? null : colId,
                                      )
                                    }
                                  >
                                    <Filter className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className="w-64 p-3"
                                >
                                  <ResourceTableFilterContent
                                    type={filterType}
                                    draft={draft}
                                    options={meta?.filter?.options}
                                    onSearch={meta?.filter?.onSearch}
                                    onChange={(next) =>
                                      setFilterDrafts((prev) => ({
                                        ...prev,
                                        [colId]: next,
                                      }))
                                    }
                                    onCancel={() => {
                                      setFilterDrafts((prev) => ({
                                        ...prev,
                                        [colId]: appliedFilters[colId],
                                      }));
                                      setOpenFilterFor(null);
                                    }}
                                    onApply={() => {
                                      applyColumnFilter(colId);
                                      setOpenFilterFor(null);
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {header.column.columnDef.header !== undefined
                              ? flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )
                              : computedHeader}
                          </div>
                        ))}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={reactTable.getVisibleLeafColumns().length}
                  className="p-4"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "content"
                          ? "max-w-xs truncate"
                          : "whitespace-nowrap"
                      }
                    >
                      {cell.column.id === "actions" && actions.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {actions.map((action) => (
                              <DropdownMenuItem
                                key={action.label}
                                onClick={() => action.onClick(row.original)}
                                className={
                                  action.variant === "danger"
                                    ? "text-destructive"
                                    : undefined
                                }
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </UITable>
      </div>

      <ResourceTablePagination
        pageIndex={getState().pagination.pageIndex}
        pageCount={getPageCount()}
        canPreviousPage={getCanPreviousPage() && !isLoading}
        canNextPage={getCanNextPage() && !isLoading}
        pageSize={getState().pagination.pageSize}
        totalCount={tableData?.total}
        onPageChange={isLoading ? () => {} : setPageIndex}
        onPageSizeChange={isLoading ? () => {} : setPageSize}
        onNextPage={isLoading ? () => {} : nextPage}
        onPreviousPage={isLoading ? () => {} : previousPage}
        isLoading={isLoading}
      />
    </div>
  );
}
