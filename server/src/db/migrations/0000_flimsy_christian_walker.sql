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
CREATE TABLE `offices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`gst_number` varchar(15) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`contact_person` varchar(255) NOT NULL,
	`contact_number` varchar(15) NOT NULL,
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
	CONSTRAINT `office_users_id` PRIMARY KEY(`id`)
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
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
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
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `work_order_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_id` int NOT NULL,
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
	CONSTRAINT `work_order_sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`client_id` int NOT NULL,
	`office_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`handing_over_date` timestamp NOT NULL,
	`agreement_number` varchar(255) NOT NULL,
	`agreement_url` text,
	`metric_ton` decimal(10,2),
	`metric_ton_rate` decimal(10,2),
	`description` text,
	`budget_amount` decimal(10,2),
	`expense_amount` decimal(10,2) NOT NULL DEFAULT '0',
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`cancellation_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_orders_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `client_contacts` ADD CONSTRAINT `client_contacts_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `office_users` ADD CONSTRAINT `office_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `office_users` ADD CONSTRAINT `office_users_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `office_users` ADD CONSTRAINT `office_users_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_work_order_id_work_orders_id_fk` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_sites` ADD CONSTRAINT `work_order_sites_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;