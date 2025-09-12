import { cors } from "hono/cors";
import { dbMiddleware } from "./middleware/db";
import categories from "./routes/categories";
import products from "./routes/products";
import tags from "./routes/tags";
import { factory } from "./types/env";
import { handleApiError } from "./utils/error-handler";

const app = factory
  .createApp()
  .use("*", cors({ origin: (_, c) => c.env.CORS_ORIGIN }))
  .use("*", dbMiddleware)
  .onError(handleApiError)
  .route("/categories", categories)
  .route("/products", products)
  .route("/tags", tags);

export default app;
