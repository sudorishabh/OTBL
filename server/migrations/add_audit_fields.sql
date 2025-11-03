-- Optional: Add audit fields to track who creates/modifies records
-- Run this if you want to track which user created/modified records

-- Add created_by and modified_by to offices table
ALTER TABLE offices 
ADD COLUMN created_by INT NULL,
ADD COLUMN modified_by INT NULL,
ADD COLUMN modified_at TIMESTAMP NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by and modified_by to work_orders table
ALTER TABLE work_orders
ADD COLUMN created_by INT NULL,
ADD COLUMN modified_by INT NULL,
ADD COLUMN modified_at TIMESTAMP NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by and modified_by to sites table
ALTER TABLE sites
ADD COLUMN created_by INT NULL,
ADD COLUMN modified_by INT NULL,
ADD COLUMN modified_at TIMESTAMP NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by and modified_by to clients table
ALTER TABLE clients
ADD COLUMN created_by INT NULL,
ADD COLUMN modified_by INT NULL,
ADD COLUMN modified_at TIMESTAMP NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by and modified_by to activities table
ALTER TABLE activities
ADD COLUMN created_by INT NULL,
ADD COLUMN modified_by INT NULL,
ADD COLUMN modified_at TIMESTAMP NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by and modified_by to budget_categories table
ALTER TABLE budget_categories
ADD COLUMN created_by INT NULL,
ADD COLUMN modified_by INT NULL,
ADD COLUMN modified_at TIMESTAMP NULL,
ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;
