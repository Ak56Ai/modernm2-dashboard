/*
  # Insert Sample Product Data

  1. Sample Products
    - Add featured products for testing
    - Include proper pricing and discount calculations
    - Add stock quantities and images

  2. Sample Product Images
    - Multiple images per product for gallery
*/

INSERT INTO products (name, description, price, mrp, discount, final_mrp, you_save, exclusive_reward, stock_quantity, image_url, is_featured, is_active) VALUES
('Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 79.99, 149.99, 47, 79.99, 70.00, '10% cashback', 25, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500', true, true),
('Smart Fitness Watch', 'Advanced fitness tracking with heart rate monitor and GPS', 199.99, 299.99, 33, 199.99, 100.00, '5% rewards', 15, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500', true, true),
('Portable Laptop Stand', 'Ergonomic aluminum laptop stand with adjustable height', 49.99, 79.99, 38, 49.99, 30.00, 'Free shipping', 50, 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500', false, true),
('Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi devices', 24.99, 39.99, 38, 24.99, 15.00, '15% off next order', 100, 'https://images.pexels.com/photos/4316/smartphone-desk-laptop-notebook.jpg?auto=compress&cs=tinysrgb&w=500', true, true),
('Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with blue switches', 89.99, 129.99, 31, 89.99, 40.00, 'Gaming bundle', 30, 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=500', false, true),
('4K Webcam', 'Ultra HD webcam with auto-focus and noise reduction', 129.99, 179.99, 28, 129.99, 50.00, 'Creator package', 20, 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=500', true, true),
('Bluetooth Speaker', 'Portable waterproof speaker with 360-degree sound', 59.99, 89.99, 33, 59.99, 30.00, 'Music bundle', 45, 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=500', false, true),
('USB-C Hub', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card slots', 39.99, 69.99, 43, 39.99, 30.00, 'Tech essentials', 75, 'https://images.pexels.com/photos/163117/circuit-circuit-board-resistor-computer-163117.jpeg?auto=compress&cs=tinysrgb&w=500', false, true);

-- Insert additional product images for gallery
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN SELECT id FROM products LIMIT 8 LOOP
        INSERT INTO product_images (product_id, image_url, position) VALUES
        (product_record.id, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500', 1),
        (product_record.id, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500', 2),
        (product_record.id, 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500', 3);
    END LOOP;
END $$;