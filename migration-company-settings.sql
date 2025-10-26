-- Migration: Add company settings table
-- Date: 2025-10-26
-- Description: Table to store company information for invoices and PDFs

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'LA ORIGINAL',
  tagline TEXT DEFAULT 'Distribuidora de Bebidas',
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT, -- CUIT/CUIL
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO company_settings (
  company_name,
  tagline,
  email
) VALUES (
  'LA ORIGINAL',
  'Distribuidora de Bebidas',
  'contacto@laoriginal.com'
) ON CONFLICT (id) DO NOTHING;

-- Only admins can update company settings
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company settings"
  ON company_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can update company settings"
  ON company_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
