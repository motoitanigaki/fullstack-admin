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

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  options: SelectOption[];
  label: string;
  disabled?: boolean;
  maxVisibleBadges?: number;
  onSearch?: (term: string) => void;
  placeholder?: string;
  valueParser?: (value: string) => any;
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
  onSearch,
  placeholder = "Select",
  valueParser,
}: MultiSelectProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAllBadges, setShowAllBadges] = useState(false);
  const normalizedOptions = useMemo<{ value: string; label: string }[]>(
    () =>
      options.map((o) => ({ value: String(o.value), label: String(o.label) })),
    [options],
  );

  const labelMap = useMemo(
    () => new Map(normalizedOptions.map((o) => [o.value, o.label])),
    [normalizedOptions],
  );

  const resolvedOptions = useMemo(() => {
    if (!search) return normalizedOptions;
    const lowered = search.toLowerCase();
    return normalizedOptions.filter((o) =>
      o.label.toLowerCase().includes(lowered),
    );
  }, [normalizedOptions, search]);

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
            const parsed = valueParser ? valueParser(value) : value;
            field.onChange([...current, parsed]);
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
