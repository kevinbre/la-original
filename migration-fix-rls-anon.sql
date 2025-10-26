-- Migration: Fix RLS policies to allow anonymous order creation
-- Date: 2025-10-25
-- Description: Allow anonymous users to insert orders and order_items for guest checkout

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can insert orders" ON orders;
DROP POLICY IF EXISTS "Anonymous users can insert order items" ON order_items;

-- Create new policies for anonymous users
CREATE POLICY "Anonymous users can insert orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);
