import type {
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from "@packages/types";
import type { BaseRecord, CustomParams, CustomResponse } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import axios, { type AxiosError } from "axios";

export const axiosInstance = axios.create();

const createCustomError = (
  error: AxiosError,
  message: string,
  errors?: Record<string, string | string[]>,
) => ({
  ...error,
  message,
  statusCode: error.response?.status,
  ...(errors && { errors }),
  response: error.response,
});

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data?.success === true && data.data !== undefined) {
      return { ...response, data: data.data };
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse | ApiValidationErrorResponse>) => {
    const responseData = error.response?.data;

    if (responseData) {
      if (
        typeof responseData === "object" &&
        "typed" in responseData &&
        "success" in responseData &&
        "issues" in responseData &&
        (responseData as ApiValidationErrorResponse).success === false
      ) {
        const valibotError = responseData as ApiValidationErrorResponse;
        const fieldErrors = (valibotError.issues || []).reduce(
          (acc: Record<string, string | string[]>, issue) => {
            if (!issue.path?.length) return acc;
            const lastPathItem = issue.path[issue.path.length - 1];
            const field = String(lastPathItem.key || "unknown");
            if (!acc[field]) acc[field] = issue.message;
            else
              acc[field] = Array.isArray(acc[field])
                ? [...acc[field], issue.message]
                : [acc[field], issue.message];
            return acc;
          },
          {},
        );
        return Promise.reject(
          createCustomError(error, "Validation failed", fieldErrors),
        );
      }

      if (
        "error" in responseData &&
        typeof (responseData as any).error === "object" &&
        (responseData as any).error?.message
      ) {
        return Promise.reject(
          createCustomError(error, (responseData as any).error.message),
        );
      }
    }

    return Promise.reject(
      createCustomError(error, error.message || "An error occurred"),
    );
  },
);

export const createDataProvider = (apiUrl: string) => {
  const simpleRestProvider = dataProvider(apiUrl, axiosInstance);
  return {
    ...simpleRestProvider,
    custom: async <
      TData extends BaseRecord = BaseRecord,
      TQuery = unknown,
      TPayload = unknown,
    >(
      params: CustomParams<TQuery, TPayload>,
    ): Promise<CustomResponse<TData>> => {
      const { url, method = "get", payload, headers } = params;
      const response = await axiosInstance({
        method,
        url: `${apiUrl}${url}`,
        data: payload,
        headers,
      });
      return { data: response.data } as CustomResponse<TData>;
    },
  };
};
