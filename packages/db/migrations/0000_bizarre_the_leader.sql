CREATE TABLE `activity_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technology_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activity_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clean_up_oil_spill` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length` decimal(10,2),
	`width` decimal(10,2),
	`depth` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clean_up_oil_spill_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`designation` varchar(255),
	`contact_number` varchar(15) NOT NULL,
	`email` varchar(320) NOT NULL,
	`contact_type` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`gst_number` varchar(15) NOT NULL,
	`contact_number` varchar(15) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `excavation_cont_soil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length` decimal(10,2),
	`width` decimal(10,2),
	`depth` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `excavation_cont_soil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lifting_oil_slush` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length` decimal(10,2),
	`width` decimal(10,2),
	`depth` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lifting_oil_slush_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`gst_number` varchar(15) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `office_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`office_id` int NOT NULL,
	`assigned_by` int,
	`role` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `office_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `office_user_unique_idx` UNIQUE(`office_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `oil_zappers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length` decimal(10,2),
	`width` decimal(10,2),
	`depth` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oil_zappers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`document_key` varchar(255) NOT NULL,
	`description` text,
	`client_id` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'draft',
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposals_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `site_activity_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int NOT NULL,
	`item_table_name` varchar(255) NOT NULL,
	`item_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_activity_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`work_order_id` int NOT NULL,
	`work_order_site_id` int NOT NULL,
	`job_number` varchar(255) NOT NULL,
	`area` varchar(255) NOT NULL,
	`installation` varchar(255) NOT NULL,
	`joint_estimate_number` varchar(255) NOT NULL,
	`land_owner_name` varchar(255) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`remark` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`office_id` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`office_id` int NOT NULL,
	`site_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technologies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technologies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tph` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`sample_collection_date` timestamp NOT NULL,
	`sample_send_date` timestamp NOT NULL,
	`sample_report_received` varchar(50) DEFAULT 'no',
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`tph_value` decimal(10,2),
	`lab_info` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tph_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trnsprt_oil_slush` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length` decimal(10,2),
	`width` decimal(10,2),
	`depth` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trnsprt_oil_slush_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`contact_number` varchar(15),
	`role` varchar(50) NOT NULL DEFAULT 'staff',
	`created_by` int,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `work_order_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_id` int NOT NULL,
	`client_id` int NOT NULL,
	`site_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`activity_type` varchar(50),
	`metric_ton` decimal(10,2),
	`metric_ton_rate` decimal(10,2),
	`budget_amount` decimal(10,2),
	`total_expense_amount` decimal(10,2),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_order_sites_id` PRIMARY KEY(`id`),
	CONSTRAINT `wo_site_unique_idx` UNIQUE(`work_order_id`,`site_id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`proposal_id` int NOT NULL,
	`client_id` int NOT NULL,
	`office_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`handing_over_date` timestamp NOT NULL,
	`agreement_number` varchar(255) NOT NULL,
	`agreement_url` text,
	`document_key` varchar(255) NOT NULL,
	`metric_ton` decimal(10,2),
	`metric_ton_rate` decimal(10,2),
	`technology_used` int NOT NULL,
	`activity_type` varchar(50) NOT NULL,
	`description` text,
	`budget_amount` decimal(10,2),
	`expense_amount` decimal(10,2) NOT NULL DEFAULT '0',
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`cancellation_reason` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_orders_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `zero_day_samples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`activity_description` text,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length` decimal(10,2),
	`width` decimal(10,2),
	`height` decimal(10,2),
	`volume_a1` decimal(10,2),
	`density_a2` decimal(10,2),
	`result_a` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zero_day_samples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zero_days` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`type` varchar(255) NOT NULL,
	`amount` decimal(10,2),
	`length_metric` decimal(10,2),
	`width_metric` decimal(10,2),
	`depth_metric` decimal(10,2),
	`volume_informed` decimal(10,2),
	`document_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zero_days_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activity_types` ADD CONSTRAINT `activity_types_technology_id_technologies_id_fk` FOREIGN KEY (`technology_id`) REFERENCES `technologies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clean_up_oil_spill` ADD CONSTRAINT `clean_up_oil_spill_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clean_up_oil_spill` ADD CONSTRAINT `clean_up_oil_spill_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD CONSTRAINT `client_contacts_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `excavation_cont_soil` ADD CONSTRAINT `excavation_cont_soil_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `excavation_cont_soil` ADD CONSTRAINT `excavation_cont_soil_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lifting_oil_slush` ADD CONSTRAINT `lifting_oil_slush_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lifting_oil_slush` ADD CONSTRAINT `lifting_oil_slush_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `office_users` ADD CONSTRAINT `office_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `office_users` ADD CONSTRAINT `office_users_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `office_users` ADD CONSTRAINT `office_users_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oil_zappers` ADD CONSTRAINT `oil_zappers_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oil_zappers` ADD CONSTRAINT `oil_zappers_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activity_items` ADD CONSTRAINT `site_activity_items_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activities` ADD CONSTRAINT `site_activities_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activities` ADD CONSTRAINT `site_activities_work_order_id_work_orders_id_fk` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activities` ADD CONSTRAINT `site_activities_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sites` ADD CONSTRAINT `sites_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_users` ADD CONSTRAINT `site_users_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_users` ADD CONSTRAINT `site_users_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_users` ADD CONSTRAINT `site_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tph` ADD CONSTRAINT `tph_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tph` ADD CONSTRAINT `tph_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trnsprt_oil_slush` ADD CONSTRAINT `trnsprt_oil_slush_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trnsprt_oil_slush` ADD CONSTRAINT `trnsprt_oil_slush_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_work_order_id_work_orders_id_fk` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_proposal_id_proposals_id_fk` FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_technology_used_technologies_id_fk` FOREIGN KEY (`technology_used`) REFERENCES `technologies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_day_samples` ADD CONSTRAINT `zero_day_samples_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_day_samples` ADD CONSTRAINT `zero_day_samples_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_days` ADD CONSTRAINT `zero_days_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zero_days` ADD CONSTRAINT `zero_days_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `name_idx` ON `offices` (`name`);--> statement-breakpoint
CREATE INDEX `city_idx` ON `offices` (`city`);--> statement-breakpoint
CREATE INDEX `state_idx` ON `offices` (`state`);--> statement-breakpoint
CREATE INDEX `office_user_office_idx` ON `office_users` (`office_id`);--> statement-breakpoint
CREATE INDEX `office_user_user_idx` ON `office_users` (`user_id`);--> statement-breakpoint
CREATE INDEX `proposal_client_idx` ON `proposals` (`client_id`);--> statement-breakpoint
CREATE INDEX `proposal_status_idx` ON `proposals` (`status`);--> statement-breakpoint
CREATE INDEX `site_name_idx` ON `sites` (`name`);--> statement-breakpoint
CREATE INDEX `site_city_idx` ON `sites` (`city`);--> statement-breakpoint
CREATE INDEX `site_state_idx` ON `sites` (`state`);--> statement-breakpoint
CREATE INDEX `site_office_idx` ON `sites` (`office_id`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `users` (`name`);--> statement-breakpoint
CREATE INDEX `wo_site_work_order_idx` ON `work_order_sites` (`work_order_id`);--> statement-breakpoint
CREATE INDEX `wo_site_site_idx` ON `work_order_sites` (`site_id`);--> statement-breakpoint
CREATE INDEX `wo_site_status_idx` ON `work_order_sites` (`status`);--> statement-breakpoint
CREATE INDEX `wo_client_idx` ON `work_orders` (`client_id`);--> statement-breakpoint
CREATE INDEX `wo_office_idx` ON `work_orders` (`office_id`);--> statement-breakpoint
CREATE INDEX `wo_status_idx` ON `work_orders` (`status`);--> statement-breakpoint
CREATE INDEX `wo_dates_idx` ON `work_orders` (`start_date`,`end_date`);