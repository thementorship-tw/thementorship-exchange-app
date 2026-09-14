PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contact_logs` (
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
	CONSTRAINT "contact_logs_profile_type_snapshot_check" CHECK("profile_type_snapshot" IN ('skillAndInterest', 'career'))
);
--> statement-breakpoint
INSERT INTO `__new_contact_logs`("id", "profile_id", "from_user_id", "to_user_id", "offered_resource", "wanted_item", "motivation", "contact_info", "profile_type_snapshot", "profile_offers_snapshot", "profile_wants_snapshot", "profile_description_snapshot", "read_at", "created_at") SELECT "id", "profile_id", "from_user_id", "to_user_id", "offered_resource", "wanted_item", "motivation", "contact_info", CASE WHEN "profile_type_snapshot" IN ('skill', 'interest') THEN 'skillAndInterest' ELSE "profile_type_snapshot" END, "profile_offers_snapshot", "profile_wants_snapshot", "profile_description_snapshot", "read_at", "created_at" FROM `contact_logs`;--> statement-breakpoint
DROP TABLE `contact_logs`;--> statement-breakpoint
ALTER TABLE `__new_contact_logs` RENAME TO `contact_logs`;--> statement-breakpoint
CREATE INDEX `idx_contact_profile` ON `contact_logs` (`profile_id`);--> statement-breakpoint
CREATE INDEX `idx_contact_from_created` ON `contact_logs` (`from_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_to_created` ON `contact_logs` (`to_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_to_read_created` ON `contact_logs` (`to_user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_profiles` (
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
	CONSTRAINT "profiles_type_check" CHECK("type" IN ('skillAndInterest', 'career'))
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "user_id", "type", "offers_text", "wants_text", "description", "visible", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "user_id", CASE WHEN "type" IN ('skill', 'interest') THEN 'skillAndInterest' ELSE "type" END, "offers_text", "wants_text", "description", "visible", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
CREATE INDEX `idx_profile_user` ON `profiles` (`user_id`);--> statement-breakpoint
PRAGMA foreign_keys=ON;