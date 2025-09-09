import type { ApiErrorResponse, ApiSuccessResponse } from "@packages/types";
import type { Context } from "hono";

export const successResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});

export const errorResponse = (message: string): ApiErrorResponse => ({
  success: false,
  error: { message },
});

export const setTotalHeaders = (c: Context, total: number) => {
  c.header("X-Total-Count", String(total));
  c.header("Access-Control-Expose-Headers", "X-Total-Count");
};
