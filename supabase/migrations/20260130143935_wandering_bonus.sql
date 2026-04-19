/*
  # Create Settings and Shipments Tables

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `updated_at` (timestamp)
    
    - `shipments`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `courier_name` (text)
      - `tracking_number` (text)
      - `status` (text)
      - `shipped_at` (timestamp)
      - `delivered_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for appropriate access
    
  3. Initial Data
    - Insert MBONE price setting
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  courier_name text,
  tracking_number text,
  status text NOT NULL DEFAULT 'processing',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add invoice_id column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_id text;
  END IF;
END $$;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Settings policies (read-only for authenticated users)
CREATE POLICY "Settings are viewable by authenticated users"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

-- Shipments policies
CREATE POLICY "Users can view shipments for their orders"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = shipments.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Insert initial MBONE price setting
INSERT INTO settings (key, value) VALUES ('mbone_price_usd', '0.25')
ON CONFLICT (key) DO NOTHING;