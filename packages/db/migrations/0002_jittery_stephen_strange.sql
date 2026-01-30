CREATE TABLE `bioremediation_cont_soil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`estimated_quantity` decimal(10,2) NOT NULL,
	`amount` decimal(10,2),
	`transportation_km` decimal(10,2),
	`type` varchar(255) NOT NULL,
	CONSTRAINT `bioremediation_cont_soil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cleaning_up_soil_area` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`estimated_quantity` decimal(10,2) NOT NULL,
	`amount` decimal(10,2),
	`transportation_km` decimal(10,2),
	`type` varchar(255) NOT NULL,
	CONSTRAINT `cleaning_up_soil_area_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `excavation_cont_soil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`estimated_quantity` decimal(10,2) NOT NULL,
	`amount` decimal(10,2),
	`transportation_km` decimal(10,2),
	`type` varchar(255) NOT NULL,
	CONSTRAINT `excavation_cont_soil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lifting_recovery_oil_slush` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`estimated_quantity` decimal(10,2) NOT NULL,
	`amount` decimal(10,2),
	`transportation_km` decimal(10,2),
	`type` varchar(255) NOT NULL,
	CONSTRAINT `lifting_recovery_oil_slush_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refilling_excavated_cont_soil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`estimated_quantity` decimal(10,2) NOT NULL,
	`amount` decimal(10,2),
	`transportation_km` decimal(10,2),
	`type` varchar(255) NOT NULL,
	CONSTRAINT `refilling_excavated_cont_soil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transportation_cont_soil` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_activity_id` int,
	`work_order_site_id` int NOT NULL,
	`estimated_quantity` decimal(10,2) NOT NULL,
	`amount` decimal(10,2),
	`transportation_km` decimal(10,2),
	`type` varchar(255) NOT NULL,
	CONSTRAINT `transportation_cont_soil_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `work_order_sites` MODIFY COLUMN `process_type` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `bioremediation_cont_soil` ADD CONSTRAINT `bioremediation_cont_soil_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bioremediation_cont_soil` ADD CONSTRAINT `bioremediation_cont_soil_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cleaning_up_soil_area` ADD CONSTRAINT `cleaning_up_soil_area_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cleaning_up_soil_area` ADD CONSTRAINT `cleaning_up_soil_area_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `excavation_cont_soil` ADD CONSTRAINT `excavation_cont_soil_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `excavation_cont_soil` ADD CONSTRAINT `excavation_cont_soil_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lifting_recovery_oil_slush` ADD CONSTRAINT `lifting_recovery_oil_slush_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lifting_recovery_oil_slush` ADD CONSTRAINT `lifting_recovery_oil_slush_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refilling_excavated_cont_soil` ADD CONSTRAINT `refilling_excavated_cont_soil_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refilling_excavated_cont_soil` ADD CONSTRAINT `refilling_excavated_cont_soil_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transportation_cont_soil` ADD CONSTRAINT `transportation_cont_soil_site_activity_id_site_activity_items_id_fk` FOREIGN KEY (`site_activity_id`) REFERENCES `site_activity_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transportation_cont_soil` ADD CONSTRAINT `transportation_cont_soil_work_order_site_id_work_order_sites_id_fk` FOREIGN KEY (`work_order_site_id`) REFERENCES `work_order_sites`(`id`) ON DELETE cascade ON UPDATE no action;