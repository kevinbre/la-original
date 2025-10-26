-- Migration: Add delivery_date column to orders table
-- Date: 2025-10-25

-- Add delivery_date column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- Add a comment for documentation
COMMENT ON COLUMN orders.delivery_date IS 'Fecha de entrega deseada por el cliente';
