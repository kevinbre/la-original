-- =====================================================
-- ACTUALIZACIONES DEL SCHEMA - LA ORIGINAL
-- =====================================================
-- Ejecuta este script DESPUÉS del schema principal

-- 1. Agregar campos nuevos a la tabla orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_rejected_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 2. Agregar nuevo estado 'rechazado' a orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pendiente',
    'en_revision',
    'presupuestado',
    'confirmado',
    'en_preparacion',
    'listo_entrega',
    'completado',
    'cancelado',
    'rechazado'  -- NUEVO: cuando el cliente rechaza el presupuesto
  ));

-- 3. Crear tabla de notificaciones para admins
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quote_confirmed', 'quote_rejected', 'new_order')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índice para consultas rápidas de notificaciones no leídas
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read, created_at DESC);

-- 5. Función para crear notificación cuando cliente confirma presupuesto
CREATE OR REPLACE FUNCTION notify_admin_quote_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmado' AND OLD.status = 'presupuestado' THEN
    INSERT INTO admin_notifications (order_id, type, title, message)
    VALUES (
      NEW.id,
      'quote_confirmed',
      'Presupuesto Confirmado',
      'El cliente ' || NEW.customer_name || ' ha confirmado el presupuesto del pedido ' || NEW.order_number
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para crear notificación cuando cliente rechaza presupuesto
CREATE OR REPLACE FUNCTION notify_admin_quote_rejected()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rechazado' AND OLD.status = 'presupuestado' THEN
    INSERT INTO admin_notifications (order_id, type, title, message)
    VALUES (
      NEW.id,
      'quote_rejected',
      'Presupuesto Rechazado',
      'El cliente ' || NEW.customer_name || ' ha rechazado el presupuesto del pedido ' || NEW.order_number
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para notificar confirmación de presupuesto
DROP TRIGGER IF EXISTS on_quote_confirmed ON orders;
CREATE TRIGGER on_quote_confirmed
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'confirmado' AND OLD.status = 'presupuestado')
  EXECUTE FUNCTION notify_admin_quote_confirmed();

-- 8. Trigger para notificar rechazo de presupuesto
DROP TRIGGER IF EXISTS on_quote_rejected ON orders;
CREATE TRIGGER on_quote_rejected
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'rechazado' AND OLD.status = 'presupuestado')
  EXECUTE FUNCTION notify_admin_quote_rejected();

-- 9. Políticas RLS para admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view notifications"
  ON admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update notifications"
  ON admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 10. Actualizar política de orders para que clientes puedan confirmar/rechazar
-- Los clientes pueden actualizar sus propios pedidos cuando están en estado 'presupuestado'
DROP POLICY IF EXISTS "Users can update their presupuestado orders" ON orders;
CREATE POLICY "Users can update their presupuestado orders"
  ON orders FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'presupuestado')
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 11. Vista para ver notificaciones con información del pedido
CREATE OR REPLACE VIEW admin_notifications_with_order AS
SELECT
  n.*,
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.total,
  o.status as order_status
FROM admin_notifications n
LEFT JOIN orders o ON n.order_id = o.id
ORDER BY n.created_at DESC;

-- Conceder permisos en la vista
GRANT SELECT ON admin_notifications_with_order TO authenticated;

-- 12. Función para marcar todas las notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE admin_notifications
  SET read = true
  WHERE read = false
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Función para obtener conteo de notificaciones no leídas
CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM admin_notifications
  WHERE read = false;
  RETURN count;
END;
$$ LANGUAGE plpgsql;
