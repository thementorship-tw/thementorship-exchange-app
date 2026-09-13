import { ApiReference } from "@scalar/nextjs-api-reference";

const apiReferenceHandler = ApiReference({
  url: "/api/openapi.json",
  pageTitle: "The Mentorship Exchange API",
});

export function GET(): Response {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  return apiReferenceHandler();
}
