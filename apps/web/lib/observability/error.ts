import { captureSentryException } from "@/lib/observability/sentry";

function getCaptureErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.slice(0, 160)
    };
  }

  return { name: "UnknownError" };
}

export async function captureAppError(
  error: unknown,
  context: {
    area: string;
    action?: string;
    extra?: Record<string, unknown>;
  }
) {
  await captureSentryException(error, {
    tags: {
      area: context.area,
      ...(context.action ? { action: context.action } : {})
    },
    extra: context.extra
  }).catch((captureError: unknown) => {
    console.error(
      "[Xreviews observability] Failed to capture error",
      getCaptureErrorSummary(captureError)
    );
  });
}
