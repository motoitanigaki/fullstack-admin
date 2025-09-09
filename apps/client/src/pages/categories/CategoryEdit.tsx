import { categoryUpdateSchema } from "@packages/schema";
import { useNavigation } from "@refinedev/core";
import { ResourceForm, TextField } from "@/components/resource-form";
import { CheckboxField } from "@/components/resource-form/fields/CheckboxField";

export const CategoryEdit = () => {
  const { list } = useNavigation();

  return (
    <ResourceForm
      schema={categoryUpdateSchema}
      onCancel={() => list("categories")}
    >
      <TextField name="name" label="Name" />
      <CheckboxField name="isActive" label="Active" />
    </ResourceForm>
  );
};
