RENAME TABLE `bioremediation_cont_soil` TO `biorem_cont_soil`;--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` DROP FOREIGN KEY `bioremediation_cont_soil_site_activity_id_site_activity_items_id_fk`;
--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` DROP FOREIGN KEY `bioremediation_cont_soil_work_order_site_id_work_order_sites_id_fk`;
--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` ADD CONSTRAINT `biorem_cont_soil_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` ADD CONSTRAINT `biorem_cont_soil_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;