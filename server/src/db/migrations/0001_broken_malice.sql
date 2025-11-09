CREATE TABLE `oil_zapper_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`sent_kg` decimal(10,2),
	`sent_date` timestamp,
	`bill_document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oil_zapper_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oil_zapper_indents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`oil_zapper_activity_id` int NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`kg` decimal(10,2),
	`proposed_amount` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oil_zapper_indents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tph_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`sample_collection_date` timestamp NOT NULL,
	`sample_send_date` timestamp NOT NULL,
	`sample_report_received` varchar(50) DEFAULT 'no',
	`report_document_url` text,
	`tph_value` decimal(10,2),
	`lab_info` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tph_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zero_day_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`length_metric` decimal(10,2),
	`width_metric` decimal(10,2),
	`depth_metric` decimal(10,2),
	`volume_informed` decimal(10,2),
	`document_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zero_day_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zero_day_samples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`length` decimal(10,2),
	`width` decimal(10,2),
	`height` decimal(10,2),
	`volume_a1` decimal(10,2),
	`density_a2` decimal(10,2),
	`result_a` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zero_day_samples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `oil_zapper_activities` ADD CONSTRAINT `oil_zapper_activities_wo_site_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oil_zapper_indents` ADD CONSTRAINT `oil_zapper_indents_activity_fk` FOREIGN KEY (`oil_zapper_activity_id`) REFERENCES `oil_zapper_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tph_activities` ADD CONSTRAINT `tph_activities_wo_site_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_day_activities` ADD CONSTRAINT `zero_day_activities_wo_site_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_day_samples` ADD CONSTRAINT `zero_day_samples_wo_site_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;