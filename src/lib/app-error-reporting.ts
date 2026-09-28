type AppErrorDetails = {
  message: string;
  stack?: string;
  route?: string;
  context: Record<string, unknown>;
};

function getErrorDetails(error: unknown, context: Record<string, unknown>): AppErrorDetails {
  const route = typeof window === "undefined" ? undefined : window.location.pathname;

  if (error instanceof Response) {
    return {
      message: `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`,
      ...(route ? { route } : {}),
      context,
    };
  }

  return {
    message: error instanceof Error ? error.message : String(error),
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    ...(route ? { route } : {}),
    context,
  };
}

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("Portfolio runtime error", getErrorDetails(error, context), error);
}
