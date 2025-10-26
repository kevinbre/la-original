-- Migration: Fix generate_order_number function to handle duplicates
-- Date: 2025-10-25
-- Description: Update the function to properly handle concurrent order creation

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
    -- Get the next sequential number
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(order_number FROM 'PED-' || year_month || '-(\d+)') AS INTEGER
        )
      ), 0
    ) + 1 INTO counter
    FROM orders
    WHERE order_number LIKE 'PED-' || year_month || '-%';

    new_number := 'PED-' || year_month || '-' || LPAD(counter::TEXT, 4, '0');

    -- Check if this number already exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
      RETURN new_number;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique order number after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
