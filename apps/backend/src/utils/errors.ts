export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "INVALID_SQL"
  | "FORBIDDEN_SQL"
  | "OPENAI_ERROR"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly expose: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    options?: { cause?: unknown; expose?: boolean },
  ) {
    super(message, { cause: options?.cause });
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.expose = options?.expose ?? true;
  }
}

/** Underlying reason from a driver/network error, e.g. `column "x" does not exist`. */
export function describeCause(cause: unknown): string {
  // Node reports "connection refused on every resolved address" as an AggregateError with an empty message.
  if (cause instanceof AggregateError && cause.errors.length) {
    return describeCause(cause.errors[0]);
  }
  if (cause instanceof Error) {
    return cause.message || (cause as { code?: string }).code || cause.name;
  }
  return String(cause);
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        error: err.code,
        message: err.expose ? err.message : "Request failed",
      },
    };
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  return {
    statusCode: 500,
    body: {
      error: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
    },
  };
}
