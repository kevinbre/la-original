-- ============================================
-- MIGRACIÓN COMPLETA - LA ORIGINAL
-- EJECUTAR TODO ESTE ARCHIVO EN SUPABASE
-- ============================================

-- 1. Agregar columna delivery_date a orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
COMMENT ON COLUMN orders.delivery_date IS 'Fecha de entrega deseada por el cliente';

-- 2. Políticas RLS para usuarios anónimos
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

-- 3. Crear tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- RLS para customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger para updated_at en customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Agregar customer_id a orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- 5. Arreglar función generate_order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  counter INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');

  -- Lock the table to prevent race conditions
  LOCK TABLE orders IN SHARE ROW EXCLUSIVE MODE;

  -- Get max counter for this month
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(order_number FROM '\d+$') AS INTEGER
      )
    ), 0
  ) + 1 INTO counter
  FROM orders
  WHERE order_number LIKE 'PED-' || year_month || '-%';

  new_number := 'PED-' || year_month || '-' || LPAD(counter::TEXT, 4, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT generate_order_number() as test_numero_pedido;

-- 6. Agregar product_description a order_items para guardar la descripción
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_description TEXT;

-- 7. Verificar que todo esté OK
SELECT 'Migration completed successfully!' as status;
