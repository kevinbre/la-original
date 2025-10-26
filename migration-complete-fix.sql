-- Complete Migration: Fix all issues
-- Date: 2025-10-25
-- Description: Add delivery_date, fix RLS policies, and fix order number generation

-- 1. Add delivery_date column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
COMMENT ON COLUMN orders.delivery_date IS 'Fecha de entrega deseada por el cliente';

-- 2. Drop and recreate RLS policies for anonymous users
DROP POLICY IF EXISTS "Anonymous users can insert orders" ON orders;
DROP POLICY IF EXISTS "Anonymous users can insert order items" ON order_items;

CREATE POLICY "Anonymous users can insert orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- 3. Fix generate_order_number function with proper sequence handling
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  counter INTEGER;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');

  LOOP
    -- Get the maximum counter for this month and add 1
    SELECT COALESCE(
      MAX(
        CAST(
          REGEXP_REPLACE(
            order_number,
            'PED-' || year_month || '-',
            ''
          ) AS INTEGER
        )
      ), 0
    ) + 1 INTO counter
    FROM orders
    WHERE order_number LIKE 'PED-' || year_month || '-%'
    AND order_number ~ ('^PED-' || year_month || '-\d+$');

    new_number := 'PED-' || year_month || '-' || LPAD(counter::TEXT, 4, '0');

    -- Check if this number already exists (safety check)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
      RETURN new_number;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      -- If we reach max attempts, add random suffix to avoid collision
      new_number := 'PED-' || year_month || '-' || LPAD(counter::TEXT, 4, '0') || '-' || FLOOR(RANDOM() * 1000)::TEXT;
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verify the function works
SELECT generate_order_number() as test_order_number;
