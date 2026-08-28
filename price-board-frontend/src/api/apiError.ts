import { AxiosError } from "axios";
import { strings } from "../constants/strings";

/**
 * Single responsibility: turn any thrown value from an httpClient call
 * into a Spanish, user-safe message. The backend always answers
 * { success: false, error: string } on failure.
 */
export function getApiErrorMessage(error: unknown, fallback: string = strings.common.genericError): string {
  const axiosError = error as AxiosError<{ error?: string }>;

  if (axiosError?.response?.data?.error) {
    return axiosError.response.data.error;
  }

  if (axiosError?.message === "Network Error") {
    return strings.common.networkError;
  }

  return fallback;
}
