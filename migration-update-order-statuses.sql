-- Migration: Update order statuses
-- Date: 2025-10-26
-- Description: Simplify order statuses to 5 states

-- Step 1: Drop the old constraint first
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Map old statuses to new ones
UPDATE orders
SET status = 'confirmado'
WHERE status IN ('en_revision', 'presupuestado', 'listo_entrega', 'completado');

UPDATE orders
SET status = 'pendiente'
WHERE status IN ('cancelado', 'rechazado');

-- Step 3: Add new constraint with only 5 statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check
CHECK (status IN ('pendiente', 'confirmado', 'en_preparacion', 'preparado', 'entregado'));

-- Step 4: Update any notification types that reference old statuses (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_notifications') THEN
    UPDATE admin_notifications
    SET type = 'new_order'
    WHERE type IN ('quote_confirmed', 'quote_rejected');
  END IF;
END $$;

SELECT 'Migration completed successfully - All order statuses updated' as status;
