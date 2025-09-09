import { categoryInsertSchema } from "@packages/schema";
import { useNavigation } from "@refinedev/core";
import { ResourceForm, TextField } from "@/components/resource-form";
import { CheckboxField } from "@/components/resource-form/fields/CheckboxField";

export const CategoryCreate = () => {
  const { list } = useNavigation();

  return (
    <ResourceForm
      schema={categoryInsertSchema}
      onCancel={() => list("categories")}
    >
      <TextField name="name" label="Name" />
      <CheckboxField name="isActive" label="Active" defaultChecked={true} />
    </ResourceForm>
  );
};
