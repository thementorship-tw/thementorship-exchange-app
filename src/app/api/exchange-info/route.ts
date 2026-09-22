import { withApiAuth } from "@/server/api/middleware/auth";
import {
  parseJsonBody,
  parseQuery,
  validationError,
} from "@/server/api/request";
import { PRIVATE_NO_STORE_HEADERS, apiError } from "@/server/api/response";
import {
  decodeExchangeInfoCursor,
  listExchangeInfo,
} from "@/server/exchange-info/exchange-info.repository";
import {
  DuplicateProfileTypeError,
  publishExchangeInfo,
} from "@/server/exchange-info/service";
import {
  createExchangeInfoSchema,
  exchangeInfoListQuerySchema,
} from "@/shared/api/exchange-info/schemas";

/** 交換資訊列表：無限滾動分頁，支援標籤、關鍵字篩選與新舊排序。 */
export const GET = withApiAuth(
  "GET /api/exchange-info",
  async (request, _, user) => {
    const { searchParams } = new URL(request.url);

    const validation = parseQuery(exchangeInfoListQuerySchema, {
      type: searchParams.getAll("type"),
      q: searchParams.get("q") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });
    if (!validation.ok) return validation.response;

    const { type, q, sort, cursor } = validation.data;

    const decodedCursor = cursor ? decodeExchangeInfoCursor(cursor) : undefined;
    if (decodedCursor === null) {
      return validationError({ cursor: "Invalid cursor" });
    }

    const { items, nextCursor } = await listExchangeInfo({
      viewerUserId: user.id,
      types: type,
      keyword: q || undefined,
      sort,
      cursor: decodedCursor,
    });

    return Response.json(
      { data: items, nextCursor },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);

/** 新增交換資訊。 */
export const POST = withApiAuth(
  "POST /api/exchange-info",
  async (request, _, user) => {
    const body = await parseJsonBody(request, createExchangeInfoSchema);
    if (!body.ok) return body.response;

    let exchangeInfo;
    try {
      exchangeInfo = await publishExchangeInfo(user.id, body.data);
    } catch (error) {
      if (error instanceof DuplicateProfileTypeError) {
        return apiError(
          409,
          "DUPLICATE_PROFILE_TYPE",
          "A profile of this type already exists",
        );
      }
      throw error;
    }

    return Response.json(
      { data: exchangeInfo },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
