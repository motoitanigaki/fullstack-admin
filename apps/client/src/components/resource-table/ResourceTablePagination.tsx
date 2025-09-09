import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageSize: number;
  totalCount?: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const ResourceTablePagination: React.FC<Props> = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  pageSize,
  totalCount,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onNextPage,
  onPreviousPage,
}) => {
  const currentPage = pageIndex + 1;
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min(
    (pageIndex + 1) * pageSize,
    totalCount || pageCount * pageSize,
  );

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 50, 100].map((size) => (
              <SelectItem key={`page-size-${size}`} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">
          {startItem}-{endItem} of {totalCount || pageCount * pageSize}
        </span>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(0)}
            disabled={!canPreviousPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="mx-2 flex items-center gap-2">
            <Input
              type="number"
              className="h-8 w-16 text-center"
              value={currentPage}
              disabled={isLoading}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                if (page >= 0 && page < pageCount) onPageChange(page);
              }}
              min={1}
              max={pageCount}
            />
            <span className="text-sm">of {pageCount}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextPage}
            disabled={!canNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={!canNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
