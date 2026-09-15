PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`sub` text NOT NULL,
	`email` text NOT NULL,
	`session` integer NOT NULL,
	`group` text NOT NULL,
	`google_name` text NOT NULL,
	`nickname` text NOT NULL,
	`avatar_url` text,
	`active` integer DEFAULT true NOT NULL,
	`last_login_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text,
	`deactivated_at` integer,
	`deactivated_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "users_email_lowercase_check" CHECK("__new_users"."email" = lower("__new_users"."email")),
	CONSTRAINT "users_group_check" CHECK("__new_users"."group" IN ('BD', 'Data', 'Engineering', 'UIUX', 'PM', 'Marketing'))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "sub", "email", "session", "google_name", "nickname", "avatar_url", "active", "last_login_at", "created_at", "created_by", "updated_at", "updated_by", "deactivated_at", "deactivated_by") SELECT "id", "sub", "email", "session", "google_name", "nickname", "avatar_url", "active", "last_login_at", "created_at", "created_by", "updated_at", "updated_by", "deactivated_at", "deactivated_by" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_sub_unique` ON `users` (`sub`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_whitelist` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`session` integer NOT NULL,
	`group` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deactivated_at` integer,
	CONSTRAINT "whitelist_email_lowercase_check" CHECK("__new_whitelist"."email" = lower("__new_whitelist"."email")),
	CONSTRAINT "whitelist_group_check" CHECK("__new_whitelist"."group" IN ('BD', 'Data', 'Engineering', 'UIUX', 'PM', 'Marketing'))
);
--> statement-breakpoint
INSERT INTO `__new_whitelist`("id", "email", "session", "active", "created_at", "updated_at", "deactivated_at") SELECT "id", "email", "session", "active", "created_at", "updated_at", "deactivated_at" FROM `whitelist`;--> statement-breakpoint
DROP TABLE `whitelist`;--> statement-breakpoint
ALTER TABLE `__new_whitelist` RENAME TO `whitelist`;--> statement-breakpoint
CREATE UNIQUE INDEX `whitelist_email_unique` ON `whitelist` (`email`);