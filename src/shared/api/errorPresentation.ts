import { ApiError } from "@/shared/api/client";

export function apiErrorMessage(error: unknown) {
  let message: string;

  if (error instanceof ApiError) {
    if (error.code === "network_error") {
      message = "Backend сейчас недоступен.";
    } else if (error.code === "request_timeout") {
      message = "Backend не ответил вовремя.";
    } else {
      message = error.message || "Ошибка backend.";
    }

    if (error.requestId) {
      return message + " ID запроса: " + error.requestId;
    }
    return message;
  }

  return error instanceof Error ? error.message : "Неизвестная ошибка.";
}
