ALTER TABLE `sites` ADD `office_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD CONSTRAINT `sites_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `name_idx` ON `offices` (`name`);--> statement-breakpoint
CREATE INDEX `city_idx` ON `offices` (`city`);--> statement-breakpoint
CREATE INDEX `state_idx` ON `offices` (`state`);