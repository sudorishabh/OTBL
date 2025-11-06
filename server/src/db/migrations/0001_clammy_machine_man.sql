ALTER TABLE `users` RENAME COLUMN `password_hash` TO `password`;--> statement-breakpoint
ALTER TABLE `offices` MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `site_budgets` MODIFY COLUMN `expense_amount` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `work_order_sites` MODIFY COLUMN `metric_ton` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_order_sites` MODIFY COLUMN `metric_ton_rate` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_order_sites` MODIFY COLUMN `budget_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_orders` MODIFY COLUMN `metric_ton` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_orders` MODIFY COLUMN `metric_ton_rate` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_orders` MODIFY COLUMN `budget_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_orders` MODIFY COLUMN `expense_amount` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `sites` ADD `status` varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `work_orders` ADD `client_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;