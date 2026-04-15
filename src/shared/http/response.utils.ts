export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function successResponse<T>(data: T, message = "Success"): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(code: string, message: string): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
