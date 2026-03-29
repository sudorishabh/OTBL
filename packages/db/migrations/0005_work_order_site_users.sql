CREATE TABLE `work_order_site_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_order_site_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `work_order_site_users` ADD CONSTRAINT `work_order_site_users_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_site_users` ADD CONSTRAINT `work_order_site_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX `wosu_wo_site_user_idx` ON `work_order_site_users` (`work_order_site_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `wosu_user_idx` ON `work_order_site_users` (`user_id`);
