-- Update existing users in the 'users' table with address information if missing
-- Run this script to ensure all users have complete address data

-- First, check which users are missing address information
SELECT id, email, full_name, address_line1, city, country, phone, postal_code
FROM users
WHERE address_line1 IS NULL OR city IS NULL OR country IS NULL;

-- If you need to update a specific user's address information, use this:
-- Replace the email and values with your actual user data

-- Example: Update address for a user by email
UPDATE users
SET
    address_line1 = '123 Main St',
    city = 'Casa',
    country = 'Maroc',
    phone = '0612345678',
    postal_code = '12345'
WHERE email = 'your-email@example.com';

-- To verify the update worked:
SELECT * FROM users WHERE email = 'your-email@example.com';

