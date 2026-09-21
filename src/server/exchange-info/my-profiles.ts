import type { MyProfileItem } from "@/shared/api/me-profiles/schemas";

import type { MyExchangeProfileRow } from "./exchange-info.repository";

export function serializeMyProfileItem(
  row: MyExchangeProfileRow,
): MyProfileItem {
  return {
    id: row.id,
    type: row.type,
    status: row.visible ? "active" : "delisted",
    offersText: row.offersText,
    wantsText: row.wantsText,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}
