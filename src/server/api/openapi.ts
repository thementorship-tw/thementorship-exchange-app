import { createDocument } from "zod-openapi";

// Contact Logs isn't ready to ship yet. The full path registration is kept
// commented out below for reference and should be restored once that
// feature merges — it depends on schemas/response docs that don't exist on
// this branch yet.
//
// import { z } from "zod";
//
// import {
//   apiErrorResponseDoc,
//   contactLogListResponseDoc,
//   createContactLogResponseDoc,
//   markContactLogReadResponseDoc,
// } from "@/shared/api/contact-logs/openapi";
// import {
//   contactLogListQuerySchema,
//   createContactLogSchema,
// } from "@/shared/api/contact-logs/schemas";
//
// function errorResponse(description: string) {
//   return {
//     description,
//     content: { "application/json": { schema: apiErrorResponseDoc } },
//   };
// }

/**
 * Register each feature's OpenAPI paths here as they ship. Contact Logs is
 * commented out below until that feature is ready.
 */
export function buildOpenApiDocument() {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "The Mentorship Exchange API",
      version: "1.0.0",
    },
    paths: {
      // "/api/contact-logs": {
      //   post: {
      //     tags: ["Contact Logs"],
      //     summary: "建立「我想聊」交流紀錄",
      //     requestBody: {
      //       content: {
      //         "application/json": { schema: createContactLogSchema },
      //       },
      //     },
      //     responses: {
      //       "201": {
      //         description: "Created",
      //         content: {
      //           "application/json": { schema: createContactLogResponseDoc },
      //         },
      //       },
      //       "400": errorResponse("Request body must be valid JSON"),
      //       "401": errorResponse("Authentication required"),
      //       "403": errorResponse("Account inactive or consent required"),
      //       "404": errorResponse("Profile not found"),
      //       "409": errorResponse("Cannot contact your own profile"),
      //       "422": errorResponse("Request validation failed"),
      //     },
      //   },
      //   get: {
      //     tags: ["Contact Logs"],
      //     summary: "取得 sent 或 received 紀錄列表",
      //     requestParams: { query: contactLogListQuerySchema },
      //     responses: {
      //       "200": {
      //         description: "OK",
      //         content: {
      //           "application/json": { schema: contactLogListResponseDoc },
      //         },
      //       },
      //       "401": errorResponse("Authentication required"),
      //       "403": errorResponse("Account inactive or consent required"),
      //       "422": errorResponse("Request validation failed"),
      //     },
      //   },
      // },
      // "/api/contact-logs/{id}/read": {
      //   patch: {
      //     tags: ["Contact Logs"],
      //     summary: "記錄接收者第一次閱讀時間",
      //     requestParams: {
      //       path: z.object({
      //         id: z.string().meta({ description: "Contact log ID" }),
      //       }),
      //     },
      //     responses: {
      //       "200": {
      //         description: "OK",
      //         content: {
      //           "application/json": { schema: markContactLogReadResponseDoc },
      //         },
      //       },
      //       "401": errorResponse("Authentication required"),
      //       "403": errorResponse("Account inactive or consent required"),
      //       "404": errorResponse("Contact log not found"),
      //     },
      //   },
      // },
    },
  });
}
