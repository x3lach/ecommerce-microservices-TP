-- Create addresses table for multiple addresses support
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `label` varchar(50) DEFAULT 'Home',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Migrate existing user addresses to the addresses table
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
WHERE `address_line1` IS NOT NULL;

COMMIT;

