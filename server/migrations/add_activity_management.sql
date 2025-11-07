-- Add activity type and sub-type columns to activities table
ALTER TABLE `activities` 
ADD COLUMN `activity_type` VARCHAR(50) NOT NULL DEFAULT 'general' AFTER `description`,
ADD COLUMN `activity_sub_type` VARCHAR(50) NULL AFTER `activity_type`;

-- Add activity_type to work_order_sites table
ALTER TABLE `work_order_sites`
ADD COLUMN `activity_type` VARCHAR(50) NULL AFTER `status`;

-- Modify site_activities table to make dates optional and add activity_description
ALTER TABLE `site_activities`
MODIFY COLUMN `start_date` TIMESTAMP NULL,
MODIFY COLUMN `end_date` TIMESTAMP NULL,
ADD COLUMN `activity_description` TEXT NULL AFTER `activity_id`;

-- Create zero_day_activities table
CREATE TABLE `zero_day_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_activity_id` INT NOT NULL UNIQUE,
  `length_metric` DECIMAL(10, 2) NULL,
  `width_metric` DECIMAL(10, 2) NULL,
  `depth_metric` DECIMAL(10, 2) NULL,
  `volume_informed` DECIMAL(10, 2) NULL,
  `document_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE CASCADE
);

-- Create zero_day_samples table
CREATE TABLE `zero_day_samples` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_activity_id` INT NOT NULL UNIQUE,
  `length` DECIMAL(10, 2) NULL,
  `width` DECIMAL(10, 2) NULL,
  `height` DECIMAL(10, 2) NULL,
  `volume_m3` DECIMAL(10, 3) NULL,
  `density` DECIMAL(10, 3) NULL,
  `final_value` DECIMAL(10, 3) NULL,
  `document_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE CASCADE
);

-- Create tph_activities table
CREATE TABLE `tph_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_activity_id` INT NOT NULL UNIQUE,
  `sample_collection_date` TIMESTAMP NULL,
  `sample_send_date` TIMESTAMP NULL,
  `sample_report_received_date` TIMESTAMP NULL,
  `tph_value` DECIMAL(10, 3) NULL,
  `lab_name` VARCHAR(255) NULL,
  `lab_contact` VARCHAR(15) NULL,
  `lab_address` TEXT NULL,
  `report_document_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE CASCADE
);

-- Create oil_zapper_activities table
CREATE TABLE `oil_zapper_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_activity_id` INT NOT NULL UNIQUE,
  `first_intimation_date` TIMESTAMP NULL,
  `first_intimation_raised` VARCHAR(10) DEFAULT 'no',
  `intimation_document_url` TEXT NULL,
  `activity_completed_date` TIMESTAMP NULL,
  `completion_notes` TEXT NULL,
  `completion_document_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`site_activity_id`) REFERENCES `site_activities`(`id`) ON DELETE CASCADE
);
