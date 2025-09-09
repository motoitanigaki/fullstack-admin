import type { CrudFilters } from "@refinedev/core";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";

export type FilterType =
  | "textContains"
  | "selectEquals"
  | "dateTimeRange"
  | "numberRange";

export type FilterDraft =
  | { type: "textContains"; value: string }
  | { type: "selectEquals"; value?: string }
  | { type: "dateTimeRange"; min?: string; max?: string }
  | { type: "numberRange"; min?: string; max?: string };

export type Option = { value: string; label: string };

type Spec = {
  renderInput: (args: {
    draft?: FilterDraft;
    onChange: (next: FilterDraft) => void;
    options?: Option[];
    onSearch?: (term: string) => void;
  }) => React.JSX.Element;
  isEmpty: (d?: FilterDraft) => boolean;
  toCrudFilters: (field: string, d: FilterDraft) => CrudFilters;
  formatLabel: (field: string, d: FilterDraft) => string;
};

export const FILTERS: Record<FilterType, Spec> = {
  selectEquals: {
    renderInput: ({ draft, onChange, options, onSearch }) => {
      const value = draft?.type === "selectEquals" ? draft.value : undefined;
      const list: Option[] = (options ?? []).map((o: any) => ({
        value: String(o.value),
        label: String(o.label),
      }));
      return (
        <div className="w-full">
          <Command>
            <CommandInput
              placeholder="Search"
              onValueChange={(val) => onSearch?.(val)}
            />
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {list.map((o) => {
                  const isSel = String(value ?? "") === o.value;
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.label}
                      onSelect={() =>
                        onChange({ type: "selectEquals", value: o.value })
                      }
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          isSel ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {o.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      );
    },
    isEmpty: (d) => !(d && d.type === "selectEquals" && d.value),
    toCrudFilters: (field, d) =>
      d.type === "selectEquals" && d.value
        ? [{ field, operator: "eq", value: d.value }]
        : [],
    formatLabel: (field, d) =>
      d.type === "selectEquals" ? `${field}: ${d.value ?? ""}` : field,
  },
  textContains: {
    renderInput: ({ draft, onChange }) => (
      <Input
        type="text"
        placeholder={"Contains"}
        className="h-8 w-full"
        value={draft?.type === "textContains" ? draft.value : ""}
        onChange={(e) =>
          onChange({ type: "textContains", value: e.target.value })
        }
      />
    ),
    isEmpty: (d) => !(d && d.type === "textContains" && d.value.trim()),
    toCrudFilters: (field, d) =>
      d.type === "textContains" && d.value.trim()
        ? [{ field, operator: "contains", value: d.value.trim() }]
        : [],
    formatLabel: (field, d) =>
      d.type === "textContains" ? `${field}: ${d.value}` : field,
  },
  dateTimeRange: {
    renderInput: ({ draft, onChange }) => (
      <div className="flex flex-col gap-2 w-full">
        <Input
          type="datetime-local"
          className="w-full"
          placeholder={"From"}
          value={draft?.type === "dateTimeRange" ? (draft.min ?? "") : ""}
          onChange={(e) =>
            onChange({
              type: "dateTimeRange",
              min: e.target.value,
              max: draft?.type === "dateTimeRange" ? draft.max : undefined,
            })
          }
        />
        <Input
          type="datetime-local"
          className="w-full"
          placeholder={"To"}
          value={draft?.type === "dateTimeRange" ? (draft.max ?? "") : ""}
          onChange={(e) =>
            onChange({
              type: "dateTimeRange",
              min: draft?.type === "dateTimeRange" ? draft.min : undefined,
              max: e.target.value,
            })
          }
        />
      </div>
    ),
    isEmpty: (d) => {
      if (!(d && d.type === "dateTimeRange")) return true;
      const hasMin = !!d.min;
      const hasMax = !!d.max;
      return !hasMin && !hasMax;
    },
    toCrudFilters: (field, d) => {
      if (!(d.type === "dateTimeRange")) return [];
      const out: CrudFilters = [];
      if (d.min)
        out.push({
          field,
          operator: "gte",
          value: new Date(d.min).toISOString(),
        });
      if (d.max)
        out.push({
          field,
          operator: "lte",
          value: new Date(d.max).toISOString(),
        });
      return out;
    },
    formatLabel: (field, d) =>
      d.type === "dateTimeRange"
        ? `${field}: ${d.min ?? ""}${d.min || d.max ? "-" : ""}${d.max ?? ""}`
        : field,
  },
  numberRange: {
    renderInput: ({ draft, onChange }) => (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          className="h-8 w-24"
          placeholder={"Min"}
          value={draft?.type === "numberRange" ? (draft.min ?? "") : ""}
          onChange={(e) =>
            onChange({
              type: "numberRange",
              min: e.target.value,
              max: draft?.type === "numberRange" ? draft.max : undefined,
            })
          }
          min={0}
        />
        <span className="opacity-70">-</span>
        <Input
          type="number"
          className="h-8 w-24"
          placeholder={"Max"}
          value={draft?.type === "numberRange" ? (draft.max ?? "") : ""}
          onChange={(e) =>
            onChange({
              type: "numberRange",
              min: draft?.type === "numberRange" ? draft.min : undefined,
              max: e.target.value,
            })
          }
          min={0}
        />
      </div>
    ),
    isEmpty: (d) => {
      if (!(d && d.type === "numberRange")) return true;
      const hasMin = d.min !== undefined && d.min !== "";
      const hasMax = d.max !== undefined && d.max !== "";
      return !hasMin && !hasMax;
    },
    toCrudFilters: (field, d) => {
      if (!(d.type === "numberRange")) return [];
      const out: CrudFilters = [];
      const min =
        d.min !== undefined && d.min !== "" ? Number(d.min) : undefined;
      const max =
        d.max !== undefined && d.max !== "" ? Number(d.max) : undefined;
      if (min !== undefined && !Number.isNaN(min))
        out.push({ field, operator: "gte", value: min });
      if (max !== undefined && !Number.isNaN(max))
        out.push({ field, operator: "lte", value: max });
      return out;
    },
    formatLabel: (field, d) =>
      d.type === "numberRange"
        ? `${field}: ${d.min ?? ""}${d.min || d.max ? "-" : ""}${d.max ?? ""}`
        : field,
  },
};
