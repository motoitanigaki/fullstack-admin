import { X } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { FILTERS, type FilterDraft } from "./filters";

interface Props {
  applied: Record<string, FilterDraft>;
  onClear: (colId: string) => void;
  columnLabels?: Record<string, string>;
}

export const ResourceTableFilterBadges: React.FC<Props> = ({
  applied,
  onClear,
  columnLabels,
}) => {
  const entries = Object.entries(applied);
  if (entries.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {entries.map(([colId, f]) => {
        const fieldLabel = columnLabels?.[colId] ?? colId;
        return (
          <Badge key={colId} variant="secondary" className="gap-2">
            <span>{FILTERS[f.type].formatLabel(fieldLabel, f)}</span>
            <button
              type="button"
              onClick={() => onClear(colId)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        );
      })}
    </div>
  );
};
