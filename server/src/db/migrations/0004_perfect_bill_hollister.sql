CREATE TABLE `demoActivityEg` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int NOT NULL,
	`first_intimation_date` timestamp,
	`first_intimation_raised` varchar(10) DEFAULT 'no',
	`intimation_document_url` text,
	`activity_completed_date` timestamp,
	`completion_notes` text,
	`completion_document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demoActivityEg_id` PRIMARY KEY(`id`),
	CONSTRAINT `demoActivityEg_site_activity_id_unique` UNIQUE(`site_activity_id`)
);
--> statement-breakpoint
ALTER TABLE `demoActivityEg` ADD CONSTRAINT `demoActivityEg_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;