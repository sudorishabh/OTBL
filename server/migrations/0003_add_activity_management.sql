-- Migration: Add Activity Management System
-- Run this SQL script in your MySQL database

-- Step 1: Add activity type and sub-type columns to activities table
ALTER TABLE `activities` 
ADD COLUMN `activity_type` VARCHAR(50) NOT NULL DEFAULT 'general',
ADD COLUMN `activity_sub_type` VARCHAR(50) NULL;

-- Step 2: Add activity_type to work_order_sites table  
ALTER TABLE `work_order_sites`
ADD COLUMN `activity_type` VARCHAR(50) NULL;

-- Step 3: Modify site_activities table
ALTER TABLE `site_activities`
MODIFY COLUMN `start_date` TIMESTAMP NULL,
MODIFY COLUMN `end_date` TIMESTAMP NULL,
ADD COLUMN `activity_description` TEXT NULL;

-- Step 4: Create zero_day_activities table
CREATE TABLE IF NOT EXISTS `zero_day_activities` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create zero_day_samples table
CREATE TABLE IF NOT EXISTS `zero_day_samples` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 6: Create tph_activities table
CREATE TABLE IF NOT EXISTS `tph_activities` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 7: Create oil_zapper_activities table
CREATE TABLE IF NOT EXISTS `oil_zapper_activities` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables were created
SELECT 'Migration completed successfully!' as status;
