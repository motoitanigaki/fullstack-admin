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

interface TextInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
  defaultValue?: string;
}

export function TextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  disabled = false,
  defaultValue,
}: TextInputProps<TFieldValues, TName>) {
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
                  type="text"
                  className="w-80"
                  disabled={disabled}
                  value={(field.value ?? defaultValue ?? "") as string}
                  onChange={field.onChange}
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
