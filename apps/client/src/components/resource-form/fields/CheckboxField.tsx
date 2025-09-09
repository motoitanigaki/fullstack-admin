import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CheckboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
  defaultChecked?: boolean;
}

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  disabled = false,
  defaultChecked = false,
}: CheckboxProps<TFieldValues, TName>) {
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
                <div className="flex h-9 items-center gap-2">
                  <Checkbox
                    id={name}
                    checked={Boolean(
                      (field.value as unknown as boolean | undefined) ??
                        defaultChecked,
                    )}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                    disabled={disabled}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}
