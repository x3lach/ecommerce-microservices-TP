-- Add seller_id column to products table
-- This column stores the UUID of the user who created the product

ALTER TABLE products ADD COLUMN seller_id UUID;

-- Optional: Add an index for faster lookups by seller
CREATE INDEX idx_products_seller_id ON products(seller_id);

