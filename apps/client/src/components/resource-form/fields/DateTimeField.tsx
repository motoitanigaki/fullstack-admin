import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface DateTimeProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
}

export const formatDateTimeLocal = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};

export function DateTimeField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, label, disabled = false }: DateTimeProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

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
              <FormControl>
                <Input
                  id={name}
                  type="datetime-local"
                  className="w-80"
                  disabled={disabled}
                  value={formatDateTimeLocal(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value || null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}
