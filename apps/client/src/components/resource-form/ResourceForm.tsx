import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "@refinedev/react-hook-form";
import type { ReactNode } from "react";
import type { BaseSchema, InferInput } from "valibot";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

interface Props<TSchema extends BaseSchema<any, any, any>> {
  children: ReactNode;
  schema: TSchema;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ResourceForm<TSchema extends BaseSchema<any, any, any>>({
  children,
  schema,
  onCancel,
  isLoading = false,
  submitLabel,
}: Props<TSchema>) {
  type FormData = InferInput<TSchema>;

  const form = useForm<FormData>({
    resolver: valibotResolver(schema),
  });

  return (
    <Form {...form}>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Breadcrumb />
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(form.refineCore.onFinish)}
          className="space-y-4"
        >
          {children}

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1"></div>
            <div className="col-span-4">
              <div className="flex justify-end gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    variant="secondary"
                  >
                    {"Cancel"}
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {submitLabel || "Save"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Form>
  );
}
