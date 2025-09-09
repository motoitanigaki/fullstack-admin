// Markdown editor
import MDEditor from "@uiw/react-md-editor";
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
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

interface TextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  disabled?: boolean;
  defaultValue?: string;
  height?: number;
  fullRow?: boolean;
}

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  disabled = false,
  defaultValue,
  height = 300,
  fullRow = false,
}: TextareaProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField<TFieldValues, TName>
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-5 items-start gap-4">
            {fullRow ? (
              <div className="col-span-5">
                <div className="mb-1">
                  <FormLabel>{label}</FormLabel>
                </div>
                <FormControl>
                  <div className="w-full">
                    <MDEditor
                      id={String(name)}
                      value={(field.value ?? defaultValue ?? "") as string}
                      onChange={(val) => field.onChange(val ?? "")}
                      textareaProps={{ readOnly: disabled }}
                      visibleDragbar={false}
                      height={height}
                      style={{ width: "100%" }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            ) : (
              <>
                <div className="col-span-1">
                  <FormLabel>{label}</FormLabel>
                </div>
                <div className="col-span-4">
                  <FormControl>
                    <div className="w-full">
                      <MDEditor
                        id={String(name)}
                        value={(field.value ?? defaultValue ?? "") as string}
                        onChange={(val) => field.onChange(val ?? "")}
                        textareaProps={{ readOnly: disabled }}
                        visibleDragbar={false}
                        height={height}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
