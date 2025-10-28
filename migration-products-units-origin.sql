-- Migration: Add units_per_pack and origin to products
-- Date: 2025-10-27

-- Agregar columna units_per_pack para cantidades por pack/caja
-- Ejemplos: Caja x6, Pack x12, etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS units_per_pack INTEGER;
COMMENT ON COLUMN products.units_per_pack IS 'Cantidad de unidades por pack/caja. Ej: 6, 12, 24';

-- Agregar columna origin para el origen del producto
-- Ejemplos: Carrefour, Distribuidor, Mayorista, Fabricante
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin TEXT;
COMMENT ON COLUMN products.origin IS 'Origen o proveedor del producto. Ej: carrefour, distribuidor';

-- Actualizar productos existentes (opcional)
-- Si querés setear valores por defecto para productos existentes:
-- UPDATE products SET origin = 'distribuidor' WHERE origin IS NULL;

SELECT 'Migration completed: units_per_pack and origin columns added to products' as status;
