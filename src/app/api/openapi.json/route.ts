import { buildOpenApiDocument } from "@/server/api/openapi";

export function GET(): Response {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  return Response.json(buildOpenApiDocument());
}
