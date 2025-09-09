export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

export interface ApiValidationErrorResponse {
  success: false;
  typed: false;
  issues: Array<{
    message: string;
    path?: Array<{
      key?: string | number;
    }>;
  }>;
}
