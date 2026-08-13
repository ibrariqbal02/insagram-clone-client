import { AxiosError } from "axios";

/**
 * Pulls the real `message` the backend sent back for a failed request
 * (every controller responds with `{ success: false, message: "..." }`),
 * falling back to a generic message only when the backend didn't return one
 * (e.g. a network error).
 */
export const getErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") => {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
