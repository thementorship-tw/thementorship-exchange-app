import type { z } from "zod";

import type {
  contactLogResponseSchema,
  contactLogUserSchema,
} from "@/shared/api/contact-logs/schemas";

export type { ProfileType } from "@/shared/profile-types";

export type ContactLogResponse = z.infer<typeof contactLogResponseSchema>;
export type ContactLogUser = z.infer<typeof contactLogUserSchema>;
export type ContactLogDirection = ContactLogResponse["direction"];

export type ContactLogListResponse = {
  data: ContactLogResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
