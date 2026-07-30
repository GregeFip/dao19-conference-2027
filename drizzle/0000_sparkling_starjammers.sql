CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`registration_code` text NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`organization` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`ticket_type` text NOT NULL,
	`attend_dinner` integer DEFAULT false NOT NULL,
	`need_hotel` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_code_unique` ON `registrations` (`registration_code`);--> statement-breakpoint
CREATE INDEX `registrations_created_at_idx` ON `registrations` (`created_at`);--> statement-breakpoint
CREATE INDEX `registrations_email_idx` ON `registrations` (`email`);