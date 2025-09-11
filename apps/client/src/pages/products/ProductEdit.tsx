import { status } from "@packages/constants";
import { productUpdateSchema } from "@packages/schema";
import { useNavigation } from "@refinedev/core";
import {
  DateTimeField,
  NumberField,
  ResourceForm,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/resource-form";
import { useCategorySelect } from "@/hooks/use-resource-select";

export const ProductEdit = () => {
  const { list } = useNavigation();
  const categories = useCategorySelect();

  return (
    <ResourceForm
      schema={productUpdateSchema}
      onCancel={() => list("products")}
    >
      <SelectField
        name="categoryId"
        label="Category"
        options={categories.options}
        onSearch={categories.onSearch}
        labelPath="category.name"
      />
      <TextField name="name" label="Name" />
      <TextareaField name="description" label="Description" />
      <NumberField name="price" label="Price" />
      <NumberField name="stock" label="Stock" />
      <SelectField
        name="status"
        label="Status"
        options={status.map((s) => ({ value: s, label: s }))}
      />
      <DateTimeField name="availableAt" label="Available At" />
    </ResourceForm>
  );
};
