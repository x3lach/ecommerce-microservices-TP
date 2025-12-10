-- Migration script to copy existing user addresses to the addresses table
-- Run this AFTER the user-service has started and created the addresses table
-- This is safe to run multiple times (won't create duplicates)

INSERT INTO `addresses` (`id`, `user_id`, `address_line1`, `city`, `postal_code`, `country`, `is_default`, `label`)
SELECT
  UUID(),
  `id`,
  `address_line1`,
  `city`,
  `postal_code`,
  `country`,
  1,
  'Home'
FROM `users`
WHERE `address_line1` IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `addresses` WHERE `addresses`.`user_id` = `users`.`id`
  );

