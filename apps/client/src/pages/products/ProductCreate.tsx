import { status } from "@packages/constants";
import { productInsertSchema } from "@packages/schema";
import { useNavigation, useSelect } from "@refinedev/core";
import {
  DateTimeField,
  NumberField,
  ResourceForm,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/resource-form";

export const ProductCreate = () => {
  const { list } = useNavigation();
  const categories = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    filters: [{ field: "isActive", operator: "eq", value: true }],
    sorters: [{ field: "updatedAt", order: "desc" }],
    pagination: { pageSize: 10 },
    onSearch: (value: string) =>
      value
        ? [
            {
              field: "name",
              operator: "contains",
              value,
            },
          ]
        : [],
  });

  return (
    <ResourceForm
      schema={productInsertSchema}
      onCancel={() => list("products")}
    >
      <SelectField
        name="categoryId"
        label="Category"
        options={categories.options}
        onSearch={categories.onSearch}
        valueParser={Number}
      />
      <TextField name="name" label="Name" />
      <TextareaField name="description" label="Description" />
      <NumberField name="price" label="Price" />
      <NumberField name="stock" label="Stock" defaultValue="0" />
      <SelectField
        name="status"
        label="Status"
        options={status.map((s) => ({ value: s, label: s }))}
      />
      <DateTimeField name="availableAt" label="Available At" />
    </ResourceForm>
  );
};
