import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useResourceForm } from "../ResourceFormContext";

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  options?: SelectOption[];
  label: string;
  disabled?: boolean;
  maxVisibleBadges?: number;
  labelPath?: string; // e.g., "exams[].name" to hydrate selected labels from record
  onSearch?: (term: string) => void;
  placeholder?: string;
}

export function MultiSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  options,
  label,
  disabled = false,
  maxVisibleBadges = 5,
  labelPath,
  onSearch,
  placeholder = "Select",
}: MultiSelectProps<TFieldValues, TName>) {
  const { control, getValues } = useFormContext<TFieldValues>();
  const { record } = useResourceForm();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAllBadges, setShowAllBadges] = useState(false);

  const list = useMemo<Required<SelectOption>[]>(
    () =>
      Array.isArray(options)
        ? options.map((o) => ({
            value: String(o.value),
            label: String(o.label),
          }))
        : [],
    [options],
  );

  const getByPath = (obj: unknown, path?: string): unknown => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object")
        return (acc as Record<string, unknown>)[key];
      return undefined;
    }, obj);
  };

  const getArrayAndRest = (
    obj: unknown,
    path: string | undefined,
  ): { arr: unknown[]; rest?: string } | null => {
    if (!obj || !path || !path.includes("[]")) return null;
    const [arrPath, restPath] = path.split("[].");
    const arr = getByPath(obj, arrPath);
    if (!Array.isArray(arr)) return { arr: [], rest: restPath };
    return { arr, rest: restPath };
  };

  const initialSelected: string[] = (() => {
    const v = getValues(name) as unknown;
    return Array.isArray(v) ? (v as unknown[]).map((x) => String(x)) : [];
  })();

  const recordArrInfo = getArrayAndRest(record, labelPath);
  const recordList = recordArrInfo?.arr ?? [];
  const elementLabelSubPath = recordArrInfo?.rest;

  const extrasFromRecord: SelectOption[] = initialSelected
    .map((id) => {
      const found = recordList.find((it) =>
        it && typeof it === "object"
          ? (it as Record<string, unknown>).id ===
            (Number.isNaN(Number(id)) ? id : Number(id))
          : false,
      ) as Record<string, unknown> | undefined;
      const labelVal = elementLabelSubPath
        ? getByPath(found, elementLabelSubPath)
        : (found?.name as unknown);
      const label = typeof labelVal === "string" ? labelVal : undefined;
      if (typeof label === "string" && label.length > 0)
        return { value: id, label } as SelectOption;
      return undefined;
    })
    .filter(Boolean) as SelectOption[];

  const mergedOptions = (() => {
    const map = new Map<string, SelectOption>();
    for (const o of list) map.set(o.value, o);
    for (const o of extrasFromRecord)
      if (!map.has(o.value)) map.set(o.value, o);
    return Array.from(map.values());
  })();

  const labelMap = new Map(mergedOptions.map((o) => [o.value, o.label]));

  const resolvedOptions = useMemo(() => {
    if (!search) return mergedOptions;
    const lowered = search.toLowerCase();
    return mergedOptions.filter((o) => o.label.toLowerCase().includes(lowered));
  }, [mergedOptions, search]);

  return (
    <FormField<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field }) => {
        const selectedKeys: string[] = Array.isArray(field.value)
          ? (field.value as unknown[]).map((v) => String(v))
          : [];
        // Only values that exist in options are shown
        const matchedSelectedValues = selectedKeys.filter((v) =>
          labelMap.has(v),
        );
        const toggle = (value: string) => {
          const current: unknown[] = Array.isArray(field.value)
            ? (field.value as unknown[])
            : [];
          if (selectedKeys.includes(value)) {
            field.onChange(current.filter((v) => String(v) !== value));
          } else {
            // Try to keep numeric ids numeric (similar to SelectField)
            const next = /^\d+$/.test(value) ? Number(value) : value;
            field.onChange([...current, next]);
          }
        };
        const remove = (value: string) =>
          field.onChange(
            (Array.isArray(field.value)
              ? (field.value as unknown[])
              : []
            ).filter((v) => String(v) !== value),
          );

        return (
          <FormItem>
            <div className="grid grid-cols-5 items-start gap-4">
              <div className="col-span-1">
                <FormLabel>{label}</FormLabel>
              </div>
              <div className="col-span-4">
                <div className="w-80">
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          aria-expanded={open}
                          className="w-full justify-between"
                          disabled={disabled}
                        >
                          {matchedSelectedValues.length > 0
                            ? `${matchedSelectedValues.length} selected`
                            : placeholder}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search"
                            value={search}
                            onValueChange={(val) => {
                              setSearch(val);
                              onSearch?.(val);
                            }}
                          />
                          <CommandEmpty>Nothing found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {resolvedOptions.map((option: SelectOption) => {
                                const isSel = selectedKeys.includes(
                                  option.value,
                                );
                                return (
                                  <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => toggle(option.value)}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${isSel ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {option.label}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  {matchedSelectedValues.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {(showAllBadges
                          ? matchedSelectedValues
                          : matchedSelectedValues.slice(
                              0,
                              Math.max(0, maxVisibleBadges),
                            )
                        ).map((value) => (
                          <Badge
                            key={value}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <span>{labelMap.get(value)}</span>
                            <button
                              type="button"
                              onClick={() => remove(value)}
                              disabled={disabled}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}

                        {matchedSelectedValues.length > maxVisibleBadges &&
                          !showAllBadges && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => setShowAllBadges(true)}
                            >
                              {"Show all"}
                            </Button>
                          )}

                        {matchedSelectedValues.length > maxVisibleBadges &&
                          showAllBadges && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => setShowAllBadges(false)}
                            >
                              {"Show less"}
                            </Button>
                          )}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </div>
              </div>
            </div>
          </FormItem>
        );
      }}
    />
  );
}
