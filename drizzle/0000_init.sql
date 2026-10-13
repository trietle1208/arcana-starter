CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`reading_id` text,
	`card_id` text,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`prompt` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`reading_id`) REFERENCES `readings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_entries_reading_id_unique` ON `journal_entries` (`reading_id`);--> statement-breakpoint
CREATE INDEX `journal_entries_created_at` ON `journal_entries` ("created_at" DESC);--> statement-breakpoint
CREATE TABLE `reading_cards` (
	`reading_id` text NOT NULL,
	`position_index` integer NOT NULL,
	`position_key` text NOT NULL,
	`card_id` text NOT NULL,
	`orientation` text NOT NULL,
	PRIMARY KEY(`reading_id`, `position_index`),
	FOREIGN KEY (`reading_id`) REFERENCES `readings`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reading_cards_orientation_check" CHECK("reading_cards"."orientation" IN ('upright','reversed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reading_cards_reading_id_card_id_unique` ON `reading_cards` (`reading_id`,`card_id`);--> statement-breakpoint
CREATE TABLE `readings` (
	`id` text PRIMARY KEY NOT NULL,
	`spread_id` text NOT NULL,
	`spread_version` integer NOT NULL,
	`question` text,
	`drawn_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "settings_single_row_check" CHECK("settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `study_progress` (
	`card_id` text PRIMARY KEY NOT NULL,
	`box` integer DEFAULT 1 NOT NULL,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`incorrect_count` integer DEFAULT 0 NOT NULL,
	`last_reviewed_at` integer,
	`next_review_at` integer,
	CONSTRAINT "study_progress_box_check" CHECK("study_progress"."box" BETWEEN 1 AND 5)
);
