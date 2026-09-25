import { ApiReference } from "@scalar/nextjs-api-reference";

import { withBasePath } from "@/shared/base-path";

const apiReferenceHandler = ApiReference({
  // 這個網址由瀏覽器端的 API 文件頁讀取，需要含 basePath
  url: withBasePath("/api/openapi.json"),
  pageTitle: "The Mentorship Exchange API",
});

export function GET(): Response {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  return apiReferenceHandler();
}
