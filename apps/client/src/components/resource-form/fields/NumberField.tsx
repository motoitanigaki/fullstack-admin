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

interface NumberInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
  defaultValue?: string;
}

export function NumberField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  disabled = false,
  defaultValue,
}: NumberInputProps<TFieldValues, TName>) {
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
                  type="number"
                  className="w-80"
                  disabled={disabled}
                  value={
                    field.value === undefined || field.value === null
                      ? (defaultValue ?? "")
                      : String(field.value)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? "" : Number(v));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
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
