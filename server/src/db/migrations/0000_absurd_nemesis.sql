CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`),
	CONSTRAINT `activities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `budget_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `budget_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `offices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`contact_person` varchar(255) NOT NULL,
	`contact_number` varchar(15) NOT NULL,
	`email` varchar(320) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offices_id` PRIMARY KEY(`id`),
	CONSTRAINT `offices_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `site_activity_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int NOT NULL,
	`site_budget_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expense_amount` decimal(10,2) NOT NULL,
	`description` text NOT NULL,
	`expense_date` timestamp NOT NULL,
	`category` varchar(100) NOT NULL,
	`receipt_number` varchar(100),
	CONSTRAINT `site_activity_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wo_site_id` int NOT NULL,
	`activity_id` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wo_site_id` int NOT NULL,
	`budget_category_id` int NOT NULL,
	`budget_amount` decimal(10,2) NOT NULL,
	`expense_amount` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`contact_person` varchar(255) NOT NULL,
	`contact_number` varchar(15) NOT NULL,
	`email` varchar(320) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`),
	CONSTRAINT `sites_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `work_order_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_id` int NOT NULL,
	`site_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_order_sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`office_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`description` text NOT NULL,
	`budget_amount` decimal(10,2) NOT NULL,
	`expense_amount` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`cancellation_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_orders_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `site_activity_expenses` ADD CONSTRAINT `site_activity_expenses_site_activity_id_site_activities_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activity_expenses` ADD CONSTRAINT `site_activity_expenses_site_budget_id_site_budgets_id_fk` FOREIGN KEY (`site_budget_id`) REFERENCES `site_budgets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activities` ADD CONSTRAINT `site_activities_wo_site_id_work_order_sites_id_fk` FOREIGN KEY (`wo_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_activities` ADD CONSTRAINT `site_activities_activity_id_activities_id_fk` FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_budgets` ADD CONSTRAINT `site_budgets_wo_site_id_work_order_sites_id_fk` FOREIGN KEY (`wo_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_budgets` ADD CONSTRAINT `site_budgets_budget_category_id_budget_categories_id_fk` FOREIGN KEY (`budget_category_id`) REFERENCES `budget_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_work_order_id_work_orders_id_fk` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;