-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 16, 2025 at 03:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `catalogue_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `created_at`, `is_active`, `name`, `slug`) VALUES
(0xc1a0b3da9b0f4a8d8c9a3b4c5d6e7f80, '2025-12-10 22:07:49.000000', b'1', 'Apple', 'apple'),
(0xc2a0b3da9b0f4a8d8c9a3b4c5d6e7f81, '2025-12-10 22:07:49.000000', b'1', 'Samsung', 'samsung'),
(0xc3a0b3da9b0f4a8d8c9a3b4c5d6e7f82, '2025-12-10 22:07:49.000000', b'1', 'Sony', 'sony'),
(0xc4a0b3da9b0f4a8d8c9a3b4c5d6e7f83, '2025-12-10 22:07:49.000000', b'1', 'Nike', 'nike'),
(0xc5a0b3da9b0f4a8d8c9a3b4c5d6e7f84, '2025-12-10 22:07:49.000000', b'1', 'Adidas', 'adidas'),
(0xc6a0b3da9b0f4a8d8c9a3b4c5d6e7f85, '2025-12-10 22:07:49.000000', b'1', 'HP', 'hp'),
(0xc7a0b3da9b0f4a8d8c9a3b4c5d6e7f86, '2025-12-10 22:07:49.000000', b'1', 'Dell', 'dell'),
(0xc8a0b3da9b0f4a8d8c9a3b4c5d6e7f87, '2025-12-10 22:07:49.000000', b'1', 'LG', 'lg');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `parent_id` binary(16) DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `created_at`, `description`, `is_active`, `name`, `parent_id`, `slug`, `updated_at`) VALUES
(0x40e6215d681844b2a4332468525659b3, '2025-12-10 22:05:57.000000', 'Gadgets, devices, and all things electronic.', b'1', 'Electronics', NULL, 'electronics', '2025-12-10 22:05:57.000000'),
(0x41e6215d681844b2a4332468525659b7, '2025-12-10 22:05:57.000000', 'Mobile phones and accessories.', b'1', 'Smartphones', 0x40e6215d681844b2a4332468525659b3, 'smartphones', '2025-12-10 22:05:57.000000'),
(0x42e6215d681844b2a4332468525659b8, '2025-12-10 22:05:57.000000', 'Portable computers for work and play.', b'1', 'Laptops', 0x40e6215d681844b2a4332468525659b3, 'laptops', '2025-12-10 22:05:57.000000'),
(0x50e6215d681844b2a4332468525659b4, '2025-12-10 22:05:57.000000', 'Apparel, shoes, and accessories for everyone.', b'1', 'Fashion', NULL, 'fashion', '2025-12-10 22:05:57.000000'),
(0x51e6215d681844b2a4332468525659b9, '2025-12-10 22:05:57.000000', 'Clothing and accessories for men.', b'1', 'Men\'s Fashion', 0x50e6215d681844b2a4332468525659b4, 'mens-fashion', '2025-12-10 22:05:57.000000'),
(0x52e6215d681844b2a4332468525659ba, '2025-12-10 22:05:57.000000', 'Clothing and accessories for women.', b'1', 'Women\'s Fashion', 0x50e6215d681844b2a4332468525659b4, 'womens-fashion', '2025-12-10 22:05:57.000000'),
(0x60e6215d681844b2a4332468525659b5, '2025-12-10 22:05:57.000000', 'Everything for your home, inside and out.', b'1', 'Home & Garden', NULL, 'home-garden', '2025-12-10 22:05:57.000000'),
(0x70e6215d681844b2a4332468525659b6, '2025-12-10 22:05:57.000000', 'Physical and digital books.', b'1', 'Books', NULL, 'books', '2025-12-10 22:05:57.000000');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `brand_id` binary(16) DEFAULT NULL,
  `category_id` binary(16) DEFAULT NULL,
  `package_height` decimal(38,2) DEFAULT NULL,
  `package_length` decimal(38,2) DEFAULT NULL,
  `package_width` decimal(38,2) DEFAULT NULL,
  `weight` decimal(38,2) DEFAULT NULL,
  `seller_id` binary(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `created_at`, `description`, `is_active`, `name`, `price`, `sku`, `stock_quantity`, `updated_at`, `brand_id`, `category_id`, `package_height`, `package_length`, `package_width`, `weight`, `seller_id`) VALUES
(0x1dd410578e254eabafa0ff1ea589c628, '2025-12-11 10:10:13.000000', 'apple fruitapple fruitapple fruitapple fruitapple fruit', b'1', 'apple fruit', 10.00, 'SKU-apple-fruit', 99, '2025-12-11 10:10:13.000000', 0xc1a0b3da9b0f4a8d8c9a3b4c5d6e7f80, 0x60e6215d681844b2a4332468525659b5, NULL, NULL, NULL, NULL, NULL),
(0x2abc2353fd6e4ae488184a885efbee8d, '2025-12-11 11:17:01.000000', 'OrangeOrangeOrange', b'1', 'Orange', 2.00, 'SKU-ORANGE', 22200, '2025-12-11 15:16:48.000000', NULL, 0x60e6215d681844b2a4332468525659b5, NULL, NULL, NULL, NULL, NULL),
(0x2bd56ac414274620884671fdaa90c192, '2025-12-11 10:16:07.000000', 'spring.servlet.multipart.max-request-size=50MB\nspring.servlet.multipart.max-request-size=50MB\nspring.servlet.multipart.max-request-size=50MB\n', b'1', 'spring.servlet.multipart.max-request-size=50MB', 10.00, 'SKU-spring.servlet.multipart.max-request-size=50MB', 99, '2025-12-11 10:16:07.000000', 0xc1a0b3da9b0f4a8d8c9a3b4c5d6e7f80, 0x60e6215d681844b2a4332468525659b5, NULL, NULL, NULL, NULL, NULL),
(0x536093a4977d4b0da18757e6eeb9a112, '2025-12-11 16:09:52.000000', 'Items\nItems\nItems\nItems\n', b'1', 'medic baby', 50.00, 'SKU-MEDIC-BABY', 1000, '2025-12-11 16:09:52.000000', 0xc1a0b3da9b0f4a8d8c9a3b4c5d6e7f80, 0x70e6215d681844b2a4332468525659b6, NULL, NULL, NULL, NULL, 0x321ecfa721774c63a987f7ad377351b5),
(0x766f30f0e2ed4d52a093eab28af0563c, '2025-12-11 10:40:43.000000', 'good app', b'1', 'app', 1000000.00, 'SKU-app', 0, '2025-12-11 15:11:33.000000', 0xc6a0b3da9b0f4a8d8c9a3b4c5d6e7f85, 0x40e6215d681844b2a4332468525659b3, NULL, NULL, NULL, NULL, NULL),
(0x8c5953df464d475ca3af8b2d381aff1f, '2025-12-11 10:39:43.000000', 'Bob good slave', b'1', 'bob', 100.00, 'SKU-bob', 1, '2025-12-11 10:39:43.000000', 0xc1a0b3da9b0f4a8d8c9a3b4c5d6e7f80, 0x70e6215d681844b2a4332468525659b6, NULL, NULL, NULL, NULL, NULL),
(0xb7d5f22aa8e7489297a9603a8ac8f87d, '2025-11-13 18:12:21.000000', 'This is a test product 4 :)', b'1', 'The NEW 4th Product Name', 55.99, 'SKU-004', 100, '2025-11-13 22:54:20.000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(0xba2e54ff9a2d4df6b0f3a24581b36400, '2025-11-15 08:05:24.000000', 'GOOD CONSOLE :)', b'1', 'PS2', 222.00, 'SKU-002', 219, '2025-12-06 08:48:22.000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(0xbbb9ac6e7c284340b2e97c7cdd3bb56f, '2025-12-05 22:45:49.000000', 'Titanium design, powerful camera.', b'1', 'iPhone 15 Pro', 999.99, 'SKU-NEW-001', 50, '2025-12-05 22:45:49.000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(0xedfc34ee87224ac9bfeafd90aefb4488, '2025-12-11 14:54:37.000000', 'robot nadi', b'1', 'robo', 100.00, 'SKU-ROBO', 99, '2025-12-11 14:54:37.000000', 0xc2a0b3da9b0f4a8d8c9a3b4c5d6e7f81, 0x40e6215d681844b2a4332468525659b3, NULL, NULL, NULL, NULL, 0xbe5b0d82e3274d8ea6147ef978025a20),
(0xf7e564d2de044ec3a8b1a7dff7be59af, '2025-11-13 10:44:57.000000', 'This is a test product.', b'1', 'My First Product', 99.99, 'SKU-001', 100, '2025-11-13 10:44:57.000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(0xfb819e17fbf04df38b61b2170f7a7397, '2025-11-15 08:06:04.000000', 'GOOD CONSOLE :)', b'1', 'PS3', 333.00, 'SKU-003', 333, '2025-11-15 08:06:04.000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` binary(16) NOT NULL,
  `product_id` binary(16) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `sort_order`, `created_at`) VALUES
(0x1c41d22d23c04e1681ffec9748e5cdda, 0x766f30f0e2ed4d52a093eab28af0563c, '/uploads/product-images/38398a5f-9802-4a83-8792-7c5c42448b14_Gemini_Generated_Image_1dt8qo1dt8qo1dt8.png', 0, '2025-12-11 10:40:44.000000'),
(0x2d36cd79a34644788264c759984aacac, 0x2bd56ac414274620884671fdaa90c192, '/uploads/product-images/1a84b319-6bde-490c-b17e-94e3ecbd6a81_cropped-LOGO_JNPsans-fond.png', 0, '2025-12-11 10:16:08.000000'),
(0x3787187ce83f49f892216563df1f08fc, 0x8c5953df464d475ca3af8b2d381aff1f, '/uploads/product-images/63bea86a-0898-4b3d-9012-d400f1f6cbdd_—Pngtree—character pixel art man_6178368.png', 0, '2025-12-11 10:39:43.000000'),
(0xc66adc05cdfa47bbacc3ef1eca377daa, 0x766f30f0e2ed4d52a093eab28af0563c, '/uploads/product-images/a5c64f4c-1f67-47a2-819a-dbf902599588_Gemini_Generated_Image_5blq865blq865blq.png', 0, '2025-12-11 10:40:44.000000'),
(0xd25604e190374a98a0395e51faba61f4, 0x2bd56ac414274620884671fdaa90c192, '/uploads/product-images/d450935f-7fbe-4716-9ca0-14d4d282e391_3iyach.PNG', 0, '2025-12-11 10:16:08.000000'),
(0xd5afcb3bde29433da30db6f1a1fc52bf, 0x2bd56ac414274620884671fdaa90c192, '/uploads/product-images/7d2a06b1-f790-4cfb-a672-90b22b688b44_Gemini_Generated_Image_1dt8qo1dt8qo1dt8.png', 0, '2025-12-11 10:16:08.000000'),
(0xdacb2df192fd4fa2af06432878a718f7, 0x766f30f0e2ed4d52a093eab28af0563c, '/uploads/product-images/96581d3f-ef4c-4108-8825-6a429804fbd6_ecommerce_sabt.png', 0, '2025-12-11 10:40:44.000000'),
(0xdf04016a03f74e449a9d7dbddf219233, 0x536093a4977d4b0da18757e6eeb9a112, '/uploads/product-images/afaacf67-1b56-44ec-8830-9ed7c8efafd8_add.png', 0, '2025-12-11 16:09:53.000000'),
(0xe262a196ed6b431b93f1625dd1007a8a, 0x2abc2353fd6e4ae488184a885efbee8d, '/uploads/product-images/3a9b8925-37b6-478b-a802-8fa5c500081b_download.jfif', 0, '2025-12-11 11:17:01.000000'),
(0xfdd99130807f4d17afc1d57f2087b93d, 0xedfc34ee87224ac9bfeafd90aefb4488, '/uploads/product-images/9d1d8177-a5db-45a8-b269-04c3053c5919_user.png', 0, '2025-12-11 14:54:37.000000');

-- --------------------------------------------------------

--
-- Table structure for table `product_shipping`
--

CREATE TABLE `product_shipping` (
  `id` binary(16) NOT NULL,
  `product_id` binary(16) NOT NULL,
  `shipping_option_id` binary(16) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_shipping`
--

INSERT INTO `product_shipping` (`id`, `product_id`, `shipping_option_id`, `price`, `created_at`) VALUES
(0x0747d7ac6f99466da2334fb65086da2f, 0x8c5953df464d475ca3af8b2d381aff1f, 0x33333333333333333333333333333333, 0.00, '2025-12-11 10:39:43.000000'),
(0x160f4a64166b48d0a32ce8b5494515eb, 0x2abc2353fd6e4ae488184a885efbee8d, 0x11111111111111111111111111111111, 0.00, '2025-12-11 11:17:01.000000'),
(0x19dba59bf032493585a13df16eeaa85b, 0x8c5953df464d475ca3af8b2d381aff1f, 0x11111111111111111111111111111111, 0.00, '2025-12-11 10:39:43.000000'),
(0x1db0ba978bdd4e78846f011d08471f77, 0x536093a4977d4b0da18757e6eeb9a112, 0x22222222222222222222222222222222, 0.00, '2025-12-11 16:09:52.000000'),
(0x7e0b789a6d6e43e8aec12f60ec60c6eb, 0xedfc34ee87224ac9bfeafd90aefb4488, 0x33333333333333333333333333333333, 0.00, '2025-12-11 14:54:37.000000'),
(0x99aad77942da4ff3aa3fe9b7d3796c94, 0x536093a4977d4b0da18757e6eeb9a112, 0x33333333333333333333333333333333, 0.00, '2025-12-11 16:09:52.000000'),
(0xaab3255b1e1944fc819da52be22eada0, 0x2bd56ac414274620884671fdaa90c192, 0x11111111111111111111111111111111, 0.00, '2025-12-11 10:16:07.000000'),
(0xb7d77022c8b04f0d990af9cd3b2a91f6, 0x1dd410578e254eabafa0ff1ea589c628, 0x11111111111111111111111111111111, 0.00, '2025-12-11 10:10:13.000000'),
(0xbe5a932605894534b2c3218efbb36ddb, 0x766f30f0e2ed4d52a093eab28af0563c, 0x33333333333333333333333333333333, 0.00, '2025-12-11 10:40:43.000000'),
(0xd1994f4142dc4e3d8e4a16a9020f7859, 0xedfc34ee87224ac9bfeafd90aefb4488, 0x11111111111111111111111111111111, 0.00, '2025-12-11 14:54:37.000000'),
(0xe299c29daf0b4b059f488c43380615a6, 0x536093a4977d4b0da18757e6eeb9a112, 0x11111111111111111111111111111111, 0.00, '2025-12-11 16:09:52.000000'),
(0xe67fbcaedf484b10ade53694a4bd0519, 0x2abc2353fd6e4ae488184a885efbee8d, 0x33333333333333333333333333333333, 0.00, '2025-12-11 11:17:01.000000'),
(0xf36f6e2a6a7d406497b68a81130c7a98, 0xedfc34ee87224ac9bfeafd90aefb4488, 0x22222222222222222222222222222222, 0.00, '2025-12-11 14:54:37.000000');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_options`
--

CREATE TABLE `shipping_options` (
  `id` binary(16) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `estimated_days_min` int(11) DEFAULT NULL,
  `estimated_days_max` int(11) DEFAULT NULL,
  `is_active` bit(1) DEFAULT b'1',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_options`
--

INSERT INTO `shipping_options` (`id`, `name`, `description`, `estimated_days_min`, `estimated_days_max`, `is_active`, `created_at`, `updated_at`) VALUES
(0x11111111111111111111111111111111, 'Standard Shipping', 'Delivery in 5-7 business days', 5, 7, b'1', '2025-12-11 00:00:00.000000', '2025-12-11 00:00:00.000000'),
(0x22222222222222222222222222222222, 'Express Shipping', 'Delivery in 2-3 business days', 2, 3, b'1', '2025-12-11 00:00:00.000000', '2025-12-11 00:00:00.000000'),
(0x33333333333333333333333333333333, 'Local Pickup', 'Buyer picks up the item', 0, 0, b'1', '2025-12-11 00:00:00.000000', '2025-12-11 00:00:00.000000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKoce3937d2f4mpfqrycbr0l93m` (`name`),
  ADD UNIQUE KEY `UKpnhnc9urm6fro7oseu9vka70q` (`slug`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKoul14ho7bctbefv8jywp5v3i2` (`slug`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKfhmd06dsmj6k0n90swsh8ie9g` (`sku`),
  ADD KEY `FKa3a4mpsfdf4d2y6r8ra3sc8mv` (`brand_id`),
  ADD KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_images_to_products` (`product_id`);

--
-- Indexes for table `product_shipping`
--
ALTER TABLE `product_shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_product_shipping_option` (`product_id`,`shipping_option_id`),
  ADD KEY `FK_shipping_option_id` (`shipping_option_id`);

--
-- Indexes for table `shipping_options`
--
ALTER TABLE `shipping_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_shipping_option_name` (`name`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKa3a4mpsfdf4d2y6r8ra3sc8mv` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_to_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_shipping`
--
ALTER TABLE `product_shipping`
  ADD CONSTRAINT `FK_product_shipping_to_option` FOREIGN KEY (`shipping_option_id`) REFERENCES `shipping_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_product_shipping_to_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
