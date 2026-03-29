CREATE TABLE `work_order_site_operator_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_order_site_id` int NOT NULL,
	`uploaded_by_user_id` int NOT NULL,
	`description` text NOT NULL,
	`file_name` varchar(512),
	`document_url` text NOT NULL,
	`document_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_order_site_operator_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `work_order_site_operator_uploads` ADD CONSTRAINT `wosou_wo_site_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_order_site_operator_uploads` ADD CONSTRAINT `wosou_uploader_fk` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `wosou_wo_site_idx` ON `work_order_site_operator_uploads` (`work_order_site_id`);--> statement-breakpoint
CREATE INDEX `wosou_user_idx` ON `work_order_site_operator_uploads` (`uploaded_by_user_id`);
