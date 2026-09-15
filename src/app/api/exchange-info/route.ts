import { withApiAuth } from "@/server/api/middleware/auth";
import {
  parseJsonBody,
  toFieldErrors,
  validationError,
} from "@/server/api/request";
import { PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  createExchangeInfo,
  decodeExchangeInfoCursor,
  listExchangeInfo,
} from "@/server/exchange-info/exchange-info.repository";
import {
  createExchangeInfoSchema,
  exchangeInfoListQuerySchema,
} from "@/shared/api/exchange-info/schemas";

/** 交換資訊列表：無限滾動分頁，支援標籤、關鍵字篩選與新舊排序。 */
export const GET = withApiAuth("GET /api/exchange-info", async (request) => {
  const { searchParams } = new URL(request.url);

  const parsed = exchangeInfoListQuerySchema.safeParse({
    type: searchParams.getAll("type"),
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) return validationError(toFieldErrors(parsed.error));

  const { type, q, sort, cursor } = parsed.data;

  const decodedCursor = cursor ? decodeExchangeInfoCursor(cursor) : undefined;
  if (decodedCursor === null) {
    return validationError({ cursor: "Invalid cursor" });
  }

  const { items, nextCursor } = await listExchangeInfo({
    types: type,
    keyword: q || undefined,
    sort,
    cursor: decodedCursor,
  });

  return Response.json(
    { data: items, nextCursor },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
});

/** 新增交換資訊。 */
export const POST = withApiAuth(
  "POST /api/exchange-info",
  async (request, _, user) => {
    const body = await parseJsonBody(request, createExchangeInfoSchema);
    if (!body.ok) return body.response;

    const exchangeInfo = await createExchangeInfo(user.id, body.data);

    return Response.json(
      { data: exchangeInfo },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
