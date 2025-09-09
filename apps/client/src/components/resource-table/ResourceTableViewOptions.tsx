import type { Table } from "@tanstack/react-table";
import { Check, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TableLike<TData> = Pick<Table<TData>, "getAllLeafColumns">;

type Props<TData> = {
  table: TableLike<TData>;
  className?: string;
  columnLabels?: Record<string, string>;
};

export function ResourceTableViewOptions<TData>({
  table,
  className,
  columnLabels,
}: Props<TData>) {
  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide?.())
    .filter((col) => col.id !== "actions");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings2 className="h-4 w-4" />
          {"View"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{"Columns"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const id = String(column.id);
          const label = columnLabels?.[id] ?? id;
          return (
            <DropdownMenuItem
              key={column.id}
              className="capitalize"
              onSelect={(e) => {
                e.preventDefault();
                column.toggleVisibility(!column.getIsVisible());
              }}
            >
              {label}
              {column.getIsVisible() && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
