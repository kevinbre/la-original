-- Migration: Complete fixes for all reported issues
-- Date: 2025-10-26

-- 1. Add color column to price_lists
ALTER TABLE price_lists ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#b85c2f';

-- 2. Remove obsolete columns from orders
ALTER TABLE orders DROP COLUMN IF EXISTS quote_rejected_at;
ALTER TABLE orders DROP COLUMN IF EXISTS quote_confirmed_at;

-- 3. Ensure guest_token is always generated (even for admin orders)
-- This is handled in the application code

-- 4. Add active toggle to product_prices (to disable products in specific lists)
ALTER TABLE product_prices ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Add whatsapp configuration to company_settings
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS show_whatsapp_button BOOLEAN DEFAULT true;

-- 6. FIX FOREIGN KEY CONSTRAINTS - ALLOW DELETE WITH CASCADE
-- This fixes the error when deleting products that are in orders
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_prices DROP CONSTRAINT IF EXISTS product_prices_product_id_fkey;
ALTER TABLE product_prices ADD CONSTRAINT product_prices_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Same for price_lists
ALTER TABLE product_prices DROP CONSTRAINT IF EXISTS product_prices_price_list_id_fkey;
ALTER TABLE product_prices ADD CONSTRAINT product_prices_price_list_id_fkey
  FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_price_list_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_price_list_id_fkey
  FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE SET NULL;

SELECT 'All migrations completed successfully' as status;
