import { z } from "zod";
import { createDocument } from "zod-openapi";

import { apiErrorResponseDoc } from "@/server/api/response-docs";
import {
  contactLogListResponseDoc,
  createContactLogResponseDoc,
  markAllContactLogsReadResponseDoc,
  markContactLogReadResponseDoc,
} from "@/server/contact-logs/openapi";
import {
  contactLogListQuerySchema,
  createContactLogSchema,
  markAllContactLogsReadQuerySchema,
} from "@/shared/api/contact-logs/schemas";

function errorResponse(description: string) {
  return {
    description,
    content: { "application/json": { schema: apiErrorResponseDoc } },
  };
}

/**
 * Only Contact Logs is registered here for now. Each feature should add its
 * own `paths` entries as it grows an OpenAPI-documented API surface.
 */
export function buildOpenApiDocument() {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "The Mentorship Exchange API",
      version: "1.0.0",
    },
    paths: {
      "/api/contact-logs": {
        post: {
          tags: ["Contact Logs"],
          summary: "建立「我想聊」交流紀錄",
          requestBody: {
            content: { "application/json": { schema: createContactLogSchema } },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": { schema: createContactLogResponseDoc },
              },
            },
            "400": errorResponse("Request body must be valid JSON"),
            "401": errorResponse("Authentication required"),
            "403": errorResponse("Account inactive or consent required"),
            "404": errorResponse("Profile not found"),
            "409": errorResponse("Cannot contact your own profile"),
            "422": errorResponse("Request validation failed"),
          },
        },
        get: {
          tags: ["Contact Logs"],
          summary: "取得 sent 或 received 紀錄列表",
          requestParams: { query: contactLogListQuerySchema },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: contactLogListResponseDoc },
              },
            },
            "401": errorResponse("Authentication required"),
            "403": errorResponse("Account inactive or consent required"),
            "422": errorResponse("Request validation failed"),
          },
        },
      },
      "/api/contact-logs/{id}/read": {
        patch: {
          tags: ["Contact Logs"],
          summary: "記錄接收者第一次閱讀時間",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Contact log ID" }),
            }),
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: markContactLogReadResponseDoc },
              },
            },
            "401": errorResponse("Authentication required"),
            "403": errorResponse("Account inactive or consent required"),
            "404": errorResponse("Contact log not found"),
          },
        },
      },
      "/api/contact-logs/read-all": {
        patch: {
          tags: ["Contact Logs"],
          summary: "將目前登入者收到且未讀的紀錄全部標記為已讀",
          requestParams: { query: markAllContactLogsReadQuerySchema },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: markAllContactLogsReadResponseDoc,
                },
              },
            },
            "401": errorResponse("Authentication required"),
            "403": errorResponse("Account inactive or consent required"),
            "422": errorResponse("Request validation failed"),
          },
        },
      },
    },
  });
}
