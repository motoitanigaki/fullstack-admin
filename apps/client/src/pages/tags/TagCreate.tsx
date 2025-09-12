import { tagInsertSchema } from "@packages/schema";
import { useNavigation } from "@refinedev/core";
import { ResourceForm, TextField } from "@/components/resource-form";

export const TagCreate = () => {
  const { list } = useNavigation();

  return (
    <ResourceForm
      resource="tags"
      schema={tagInsertSchema}
      onCancel={() => list("tags")}
    >
      <TextField name="name" label="Name" />
    </ResourceForm>
  );
};
