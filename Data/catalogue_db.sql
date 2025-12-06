-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 05, 2025 at 11:57 PM
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
  `category_id` binary(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `created_at`, `description`, `is_active`, `name`, `price`, `sku`, `stock_quantity`, `updated_at`, `brand_id`, `category_id`) VALUES
(0xb7d5f22aa8e7489297a9603a8ac8f87d, '2025-11-13 18:12:21.000000', 'This is a test product 4 :)', b'1', 'The NEW 4th Product Name', 55.99, 'SKU-004', 0, '2025-11-13 22:54:20.000000', NULL, NULL),
(0xba2e54ff9a2d4df6b0f3a24581b36400, '2025-11-15 08:05:24.000000', 'GOOD CONSOLE :)', b'1', 'PS2', 222.00, 'SKU-002', 222, '2025-11-15 08:05:24.000000', NULL, NULL),
(0xbbb9ac6e7c284340b2e97c7cdd3bb56f, '2025-12-05 22:45:49.000000', 'Titanium design, powerful camera.', b'1', 'iPhone 15 Pro', 999.99, 'SKU-NEW-001', 50, '2025-12-05 22:45:49.000000', NULL, NULL),
(0xf7e564d2de044ec3a8b1a7dff7be59af, '2025-11-13 10:44:57.000000', 'This is a test product.', b'1', 'My First Product', 99.99, 'SKU-001', 100, '2025-11-13 10:44:57.000000', NULL, NULL),
(0xfb819e17fbf04df38b61b2170f7a7397, '2025-11-15 08:06:04.000000', 'GOOD CONSOLE :)', b'1', 'PS3', 333.00, 'SKU-003', 333, '2025-11-15 08:06:04.000000', NULL, NULL);

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
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKa3a4mpsfdf4d2y6r8ra3sc8mv` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
