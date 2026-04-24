CREATE TABLE `contractors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`office_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`contact_number` varchar(15),
	`email` varchar(320),
	`address` varchar(500),
	`gst_number` varchar(15),
	`pan_number` varchar(10),
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_order_site_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`expense_type` varchar(50) NOT NULL,
	`contractor_id` int,
	`description` varchar(500) NOT NULL,
	`amount` decimal(20,2) NOT NULL,
	`expense_date` timestamp NOT NULL,
	`invoice_number` varchar(100),
	`notes` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_order_site_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contractors` ADD CONSTRAINT `contractors_office_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_site_expenses` ADD CONSTRAINT `expenses_wo_site_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_site_expenses` ADD CONSTRAINT `expenses_contractor_fk` FOREIGN KEY (`contractor_id`) REFERENCES `contractors`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_site_expenses` ADD CONSTRAINT `expenses_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contractor_office_idx` ON `contractors` (`office_id`);--> statement-breakpoint
CREATE INDEX `contractor_name_idx` ON `contractors` (`name`);--> statement-breakpoint
CREATE INDEX `expense_wo_site_idx` ON `work_order_site_expenses` (`work_order_site_id`);--> statement-breakpoint
CREATE INDEX `expense_contractor_idx` ON `work_order_site_expenses` (`contractor_id`);--> statement-breakpoint
CREATE INDEX `expense_type_idx` ON `work_order_site_expenses` (`expense_type`);--> statement-breakpoint
CREATE INDEX `expense_date_idx` ON `work_order_site_expenses` (`expense_date`);
