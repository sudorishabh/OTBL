ALTER TABLE `schedule_of_rates` MODIFY COLUMN `transportation_km` decimal(10,2);--> statement-breakpoint
ALTER TABLE `work_orders` DROP COLUMN `agreement_url`;--> statement-breakpoint
ALTER TABLE `work_orders` DROP COLUMN `metric_ton`;--> statement-breakpoint
ALTER TABLE `work_orders` DROP COLUMN `metric_ton_rate`;--> statement-breakpoint
ALTER TABLE `work_orders` DROP COLUMN `grand_total_amount`;--> statement-breakpoint
ALTER TABLE `work_orders` DROP COLUMN `expense_amount`;