import type React from "react";
import { Button } from "@/components/ui/button";
import {
  FILTERS,
  type FilterDraft,
  type FilterType,
  type Option,
} from "./filters";

interface Props {
  type: FilterType;
  draft: FilterDraft | undefined;
  onChange: (next: FilterDraft) => void;
  onCancel: () => void;
  onApply: () => void;
  options?: Option[];
  onSearch?: (term: string) => void;
}

export const ResourceTableFilterContent: React.FC<Props> = ({
  type,
  draft,
  onChange,
  onCancel,
  onApply,
  options,
  onSearch,
}) => {
  const spec = FILTERS[type];

  return (
    <div className="flex flex-col gap-2">
      {spec.renderInput({ draft, onChange, options, onSearch })}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {"Cancel"}
        </Button>
        <Button type="button" size="sm" onClick={onApply}>
          {"Search"}
        </Button>
      </div>
    </div>
  );
};
