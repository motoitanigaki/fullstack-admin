import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { errorResponse } from "./response";

interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  cause?: unknown;
}

type ApiError = HTTPException | DatabaseError | Error;

const findDatabaseError = (err: unknown): DatabaseError | null =>
  err && typeof err === "object"
    ? typeof (err as DatabaseError).code === "string"
      ? (err as DatabaseError)
      : findDatabaseError((err as DatabaseError).cause)
    : null;

export const handleApiError = (err: ApiError, c: Context): Response => {
  if (err instanceof HTTPException) {
    return c.json(errorResponse(err.message), err.status);
  }

  const dbErr = findDatabaseError(err);
  if (dbErr) {
    if (dbErr.code === "23503") {
      return c.json(
        errorResponse(
          "Cannot delete item because it is referenced by other records",
        ),
        409,
      );
    }

    console.error("Database Error:", dbErr, "Original:", err);
    return c.json(errorResponse("Database operation failed"), 500);
  }

  console.error("Unhandled Error:", err);
  return c.json(errorResponse("Internal server error"), 500);
};
