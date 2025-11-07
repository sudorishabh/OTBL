CREATE TABLE `oil_zapper_activities` (
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
	CONSTRAINT `oil_zapper_activities_id` PRIMARY KEY(`id`),
	CONSTRAINT `oil_zapper_activities_site_activity_id_unique` UNIQUE(`site_activity_id`)
);
--> statement-breakpoint
CREATE TABLE `tph_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int NOT NULL,
	`sample_collection_date` timestamp,
	`sample_send_date` timestamp,
	`sample_report_received_date` timestamp,
	`tph_value` decimal(10,3),
	`lab_name` varchar(255),
	`lab_contact` varchar(15),
	`lab_address` text,
	`report_document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tph_activities_id` PRIMARY KEY(`id`),
	CONSTRAINT `tph_activities_site_activity_id_unique` UNIQUE(`site_activity_id`)
);
--> statement-breakpoint
CREATE TABLE `zero_day_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int NOT NULL,
	`length_metric` decimal(10,2),
	`width_metric` decimal(10,2),
	`depth_metric` decimal(10,2),
	`volume_informed` decimal(10,2),
	`document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zero_day_activities_id` PRIMARY KEY(`id`),
	CONSTRAINT `zero_day_activities_site_activity_id_unique` UNIQUE(`site_activity_id`)
);
--> statement-breakpoint
CREATE TABLE `zero_day_samples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int NOT NULL,
	`length` decimal(10,2),
	`width` decimal(10,2),
	`height` decimal(10,2),
	`volume_m3` decimal(10,3),
	`density` decimal(10,3),
	`final_value` decimal(10,3),
	`document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zero_day_samples_id` PRIMARY KEY(`id`),
	CONSTRAINT `zero_day_samples_site_activity_id_unique` UNIQUE(`site_activity_id`)
);
--> statement-breakpoint
ALTER TABLE `site_activities` MODIFY COLUMN `start_date` timestamp;--> statement-breakpoint
ALTER TABLE `site_activities` MODIFY COLUMN `end_date` timestamp;--> statement-breakpoint
ALTER TABLE `activities` ADD `activity_type` varchar(50) DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `activities` ADD `activity_sub_type` varchar(50);--> statement-breakpoint
ALTER TABLE `site_activities` ADD `activity_description` text;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD `activity_type` varchar(50);--> statement-breakpoint
ALTER TABLE `oil_zapper_activities` ADD CONSTRAINT `oil_zapper_activities_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tph_activities` ADD CONSTRAINT `tph_activities_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_day_activities` ADD CONSTRAINT `zero_day_activities_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_day_samples` ADD CONSTRAINT `zero_day_samples_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;