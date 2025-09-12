import { status } from "@packages/constants";
import { productInsertSchema } from "@packages/schema";
import { useNavigation } from "@refinedev/core";
import {
  DateTimeField,
  MultiSelectField,
  NumberField,
  ResourceForm,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/resource-form";
import { useCategorySelect, useTagSelect } from "@/hooks/use-resource-select";

export const ProductCreate = () => {
  const { list } = useNavigation();
  const categories = useCategorySelect();
  const tags = useTagSelect();

  return (
    <ResourceForm
      resource="products"
      schema={productInsertSchema}
      onCancel={() => list("products")}
    >
      <SelectField
        name="categoryId"
        label="Category"
        options={categories.options}
        onSearch={categories.onSearch}
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
      <MultiSelectField
        name="tagIds"
        label="Tags"
        options={tags.options}
        onSearch={tags.onSearch}
      />
    </ResourceForm>
  );
};
