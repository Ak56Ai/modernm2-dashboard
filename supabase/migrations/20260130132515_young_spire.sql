/*
  # Create Products and Related Tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `mrp` (numeric)
      - `discount` (numeric)
      - `final_mrp` (numeric)
      - `you_save` (numeric)
      - `exclusive_reward` (text)
      - `stock_quantity` (int)
      - `image_url` (text)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `image_url` (text)
      - `position` (int)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  mrp numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  final_mrp numeric NOT NULL DEFAULT 0,
  you_save numeric DEFAULT 0,
  exclusive_reward text DEFAULT '',
  stock_quantity int DEFAULT 0,
  image_url text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position int DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);