-- Migration: Add product_unit and product_units_per_pack to order_items
-- Purpose: Store unit information (pack, caja, etc) and quantity per pack for order items
-- Date: 2025-10-28

-- Add columns to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_unit TEXT,
ADD COLUMN IF NOT EXISTS product_units_per_pack INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN order_items.product_unit IS 'Tipo de unidad del producto: pack, caja, unidad, etc';
COMMENT ON COLUMN order_items.product_units_per_pack IS 'Cantidad de unidades por pack/caja. Ej: 6, 12, 24';

-- Update existing order_items with data from products table (if possible)
UPDATE order_items oi
SET
  product_unit = p.unit,
  product_units_per_pack = p.units_per_pack
FROM products p
WHERE oi.product_id = p.id
  AND oi.product_unit IS NULL;
