ALTER TABLE `bio_oil_zapping` MODIFY COLUMN `estimated_quantity` decimal(20,2);--> statement-breakpoint
ALTER TABLE `bio_oil_zapping` MODIFY COLUMN `intended_quantity` decimal(20,2);--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` MODIFY COLUMN `estimated_quantity` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `biorem_cont_soil` MODIFY COLUMN `amount` decimal(20,2);--> statement-breakpoint
ALTER TABLE `clean_soil_area` MODIFY COLUMN `estimated_quantity` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `clean_soil_area` MODIFY COLUMN `amount` decimal(20,2);--> statement-breakpoint
ALTER TABLE `excav_cont_soil` MODIFY COLUMN `estimated_quantity` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `excav_cont_soil` MODIFY COLUMN `amount` decimal(20,2);--> statement-breakpoint
ALTER TABLE `lifting_oil_slush` MODIFY COLUMN `estimated_quantity` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `lifting_oil_slush` MODIFY COLUMN `amount` decimal(20,2);--> statement-breakpoint
ALTER TABLE `proposals` MODIFY COLUMN `proposal_amount` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `refill_excav_soil` MODIFY COLUMN `estimated_quantity` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `refill_excav_soil` MODIFY COLUMN `amount` decimal(20,2);--> statement-breakpoint
ALTER TABLE `trans_cont_soil` MODIFY COLUMN `estimated_quantity` decimal(20,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `trans_cont_soil` MODIFY COLUMN `amount` decimal(20,2);