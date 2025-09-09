import { useSelect } from "@refinedev/core";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  // Provide static options OR configure remote fetching via useSelect
  options?: SelectOption[];
  remote?: {
    resource: string;
    optionLabel: string;
    optionValue: string;
    searchField?: string; // used to build onSearch filter
    filters?: any[];
    sorters?: any[];
    pageSize?: number; // defaults to 10
  };
  label: string;
  disabled?: boolean;
  // Optional parser to transform the string value from the Select into desired type (e.g., number)
  valueParser?: (value: string) => any;
  onSearch?: (term: string) => void;
  placeholder?: string;
}

export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  options,
  remote,
  label,
  disabled = false,
  valueParser,
  // external data-handling (preferred): keep backward-compat with `remote`
  onSearch: onSearchProp,
  placeholder = "Select",
}: SelectProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Prefer external options/onSearch when provided; otherwise allow legacy `remote`
  const hasExternal = options !== undefined || onSearchProp !== undefined;

  // Call hook but disabled when using external inputs
  const remoteSelect = useSelect({
    resource: remote?.resource ?? "",
    optionLabel: remote?.optionLabel as any,
    optionValue: remote?.optionValue as any,
    filters: remote?.filters,
    sorters: remote?.sorters,
    pagination: { pageSize: remote?.pageSize ?? 10 },
    onSearch: remote?.searchField
      ? (value: string) =>
          value
            ? [
                {
                  field: remote.searchField as any,
                  operator: "contains",
                  value,
                },
              ]
            : []
      : undefined,
    queryOptions: { enabled: !!remote && !hasExternal },
  });

  const resolvedOptions: SelectOption[] = useMemo(() => {
    const normalize = (arr: any[]): SelectOption[] =>
      (arr ?? []).map((o) => ({
        label: String(o.label),
        value: String(o.value),
      }));

    if (!hasExternal && remote) {
      return normalize((remoteSelect as any).options ?? []);
    }
    const base = normalize(options ?? []);
    if (!search) return base.slice(0, 10);
    const lowered = search.toLowerCase();
    const filtered = base.filter((o) =>
      o.label.toLowerCase().includes(lowered),
    );
    return filtered.slice(0, 10);
  }, [hasExternal, remote, remoteSelect, options, search]);

  // no explicit loading state to keep component simple

  return (
    <FormField<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-5 items-start gap-4">
            <div className="col-span-1">
              <FormLabel>{label}</FormLabel>
            </div>
            <div className="col-span-4">
              <div className="w-80">
                <FormControl>
                  {disabled ? (
                    <Input
                      id={name}
                      type="text"
                      className="w-full"
                      disabled
                      value={(() => {
                        const current =
                          field.value === undefined || field.value === null
                            ? undefined
                            : String(field.value);
                        const list = resolvedOptions;
                        return (
                          list.find((o) => o.value === current)?.label ?? ""
                        );
                      })()}
                      readOnly
                    />
                  ) : (
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          aria-expanded={open}
                          className="w-full justify-between"
                          disabled={disabled}
                        >
                          {(() => {
                            const current =
                              field.value === undefined || field.value === null
                                ? undefined
                                : String(field.value);
                            const selectedLabel = resolvedOptions.find(
                              (o) => o.value === current,
                            )?.label;
                            return selectedLabel ?? placeholder;
                          })()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search"
                            value={search}
                            onValueChange={(val) => {
                              setSearch(val);
                              if (onSearchProp) onSearchProp(val);
                              else if (!hasExternal && remote?.searchField) {
                                // Delegate to refine's server-side search
                                (remoteSelect as any).onSearch?.(val);
                              }
                            }}
                          />
                          <CommandEmpty>Nothing found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {resolvedOptions.map((option) => {
                                const isSel =
                                  (field.value === undefined ||
                                  field.value === null
                                    ? undefined
                                    : String(field.value)) === option.value;
                                return (
                                  <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                      field.onChange(
                                        valueParser
                                          ? valueParser(option.value)
                                          : option.value,
                                      );
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        isSel ? "opacity-100" : "opacity-0"
                                      }`}
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
                  )}
                </FormControl>
                <FormMessage />
              </div>
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}
