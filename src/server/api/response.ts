export const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

export type ApiErrorCode =
  | "ACCOUNT_INACTIVE"
  | "CONSENT_REQUIRED"
  | "CONTACT_LOG_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "INVALID_JSON"
  | "PROFILE_NOT_FOUND"
  | "SELF_CONTACT_NOT_ALLOWED"
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(fields === undefined ? {} : { fields }),
      },
    },
    { status, headers: PRIVATE_NO_STORE_HEADERS },
  );
}
