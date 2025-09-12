import { tagUpdateSchema } from "@packages/schema";
import { useNavigation } from "@refinedev/core";
import { ResourceForm, TextField } from "@/components/resource-form";

export const TagEdit = () => {
  const { list } = useNavigation();

  return (
    <ResourceForm schema={tagUpdateSchema} onCancel={() => list("tags")}>
      <TextField name="name" label="Name" />
    </ResourceForm>
  );
};
