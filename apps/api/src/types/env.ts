import { createFactory } from "hono/factory";

export type Env = {
  Bindings: {
    HYPERDRIVE: { connectionString: string };
  };
  Variables: {
    db: ReturnType<typeof import("@packages/schema").getDb>;
  };
};

export const factory = createFactory<Env>();
