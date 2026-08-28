import { AxiosError } from "axios";

/**
 * Single responsibility: turn any thrown value from an httpClient call
 * into a Spanish, user-safe message. The backend always answers
 * { success: false, error: string } on failure.
 */
export function getApiErrorMessage(error: unknown, fallback = "Ocurrió un error. Intenta de nuevo."): string {
  const axiosError = error as AxiosError<{ error?: string }>;

  if (axiosError?.response?.data?.error) {
    return axiosError.response.data.error;
  }

  if (axiosError?.message === "Network Error") {
    return "No se pudo conectar con el servidor. Revisa tu conexión.";
  }

  return fallback;
}
