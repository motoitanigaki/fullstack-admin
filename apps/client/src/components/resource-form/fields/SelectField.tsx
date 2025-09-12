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
import { useResourceForm } from "../ResourceFormContext";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  options?: SelectOption[];
  label: string;
  disabled?: boolean;
  onSearch?: (term: string) => void;
  placeholder?: string;
  labelPath?: string;
}

export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  options,
  label,
  disabled = false,

  onSearch: onSearchProp,
  placeholder = "Select",
  labelPath,
}: SelectProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  const { record } = useResourceForm();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getByPath = (obj: unknown, path?: string): string | undefined => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object")
        return (acc as Record<string, unknown>)[key];
      return undefined;
    }, obj) as string | undefined;
  };

  const list = useMemo<SelectOption[]>(
    () => (Array.isArray(options) ? options : []),
    [options],
  );

  const mergedOptions = (() => {
    const current = form.getValues(name) as unknown as string | undefined;
    if (!current) return list;
    const has = list.some((o) => o.value === current);
    if (has) return list;
    const recLabel = getByPath(record, labelPath);
    if (typeof recLabel === "string" && recLabel.length > 0)
      return [{ value: current, label: recLabel }, ...list];
    return list;
  })();

  // no explicit loading state to keep component simple

  return (
    <FormField<TFieldValues, TName>
      control={form.control}
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
                      value={
                        getByPath(record, labelPath) ??
                        list.find(
                          (o) =>
                            o.value === (field.value as string | undefined),
                        )?.label ??
                        ""
                      }
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
                          {mergedOptions.find((o) => o.value === field.value)
                            ?.label ?? placeholder}
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
                            }}
                          />
                          <CommandEmpty>Nothing found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {(onSearchProp
                                ? mergedOptions
                                : mergedOptions.filter((o) =>
                                    o.label
                                      .toLowerCase()
                                      .includes(search.toLowerCase()),
                                  )
                              ).map((option) => {
                                const isSel =
                                  String(field.value ?? "") === option.value;
                                return (
                                  <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                      const v = option.value;
                                      const next = /^\d+$/.test(v)
                                        ? Number(v)
                                        : v;
                                      field.onChange(next as any);
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
