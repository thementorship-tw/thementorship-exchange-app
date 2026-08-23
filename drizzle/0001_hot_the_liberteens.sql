CREATE TABLE `consent_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`terms_version` text NOT NULL,
	`privacy_version` text NOT NULL,
	`agreed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_consent_user_versions` ON `consent_logs` (`user_id`,`terms_version`,`privacy_version`);--> statement-breakpoint
CREATE TABLE `contact_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`from_user_id` text NOT NULL,
	`to_user_id` text NOT NULL,
	`offered_resource` text NOT NULL,
	`wanted_item` text NOT NULL,
	`motivation` text NOT NULL,
	`contact_info` text NOT NULL,
	`profile_type_snapshot` text NOT NULL,
	`profile_offers_snapshot` text NOT NULL,
	`profile_wants_snapshot` text NOT NULL,
	`profile_description_snapshot` text,
	`read_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "contact_logs_profile_type_snapshot_check" CHECK("contact_logs"."profile_type_snapshot" IN ('skill', 'career', 'interest'))
);
--> statement-breakpoint
CREATE INDEX `idx_contact_profile` ON `contact_logs` (`profile_id`);--> statement-breakpoint
CREATE INDEX `idx_contact_from_created` ON `contact_logs` (`from_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_to_created` ON `contact_logs` (`to_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_to_read_created` ON `contact_logs` (`to_user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`offers_text` text NOT NULL,
	`wants_text` text NOT NULL,
	`description` text,
	`visible` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text,
	`deleted_at` integer,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "profiles_type_check" CHECK("profiles"."type" IN ('skill', 'career', 'interest'))
);
--> statement-breakpoint
CREATE INDEX `idx_profile_user` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`fcm_token` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deactivated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_fcm_token_unique` ON `push_subscriptions` (`fcm_token`);--> statement-breakpoint
CREATE INDEX `idx_push_user_active` ON `push_subscriptions` (`user_id`,`active`);--> statement-breakpoint
CREATE TABLE `whitelist` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`session` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deactivated_at` integer,
	CONSTRAINT "whitelist_email_lowercase_check" CHECK("whitelist"."email" = lower("whitelist"."email"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `whitelist_email_unique` ON `whitelist` (`email`);--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`sub` text NOT NULL,
	`email` text NOT NULL,
	`session` integer NOT NULL,
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
	CONSTRAINT "users_email_lowercase_check" CHECK("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_sub_unique` ON `users` (`sub`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
