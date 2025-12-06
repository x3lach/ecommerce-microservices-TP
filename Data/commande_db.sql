-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 05, 2025 at 11:56 PM
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
-- Database: `commande_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` binary(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `created_at`, `updated_at`, `user_id`) VALUES
(0x67fbc61d5fd248b68ede45656d7ec5b9, '2025-11-13 20:11:06.000000', '2025-11-13 20:11:06.000000', 0x123e4567e89b12d3a456426614174000);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` binary(16) NOT NULL,
  `product_id` binary(16) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(38,2) NOT NULL,
  `cart_id` binary(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `total_amount` decimal(38,2) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` binary(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `created_at`, `order_number`, `address_line1`, `city`, `country`, `full_name`, `phone`, `postal_code`, `status`, `total_amount`, `updated_at`, `user_id`) VALUES
(0x3483f04ebf9046f4bd666d32c939158f, '2025-11-13 21:08:25.000000', 'ORD-1763068105982', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 66.66, '2025-11-13 21:08:25.000000', 0x123e4567e89b12d3a456426614174000),
(0x5cf43dbbe3fa4444a4191502b641c790, '2025-11-13 21:41:08.000000', 'ORD-1763070068855', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 66.66, '2025-11-13 21:41:08.000000', 0x123e4567e89b12d3a456426614174000),
(0x73d5a7ae8e194996b5d09a0bddc8b96d, '2025-11-13 21:11:02.000000', 'ORD-1763068262658', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 66.66, '2025-11-13 21:11:02.000000', 0x123e4567e89b12d3a456426614174000),
(0x9c9085c85b2a4612b022d91f55d9a58b, '2025-11-13 22:13:24.000000', 'ORD-1763072004784', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 222.20, '2025-11-13 22:13:24.000000', 0x123e4567e89b12d3a456426614174000),
(0xa3330a57afe4413c9c200960c7d09b43, '2025-11-13 20:59:19.000000', 'ORD-1763067559421', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 66.66, '2025-11-13 20:59:19.000000', 0x123e4567e89b12d3a456426614174000),
(0xae82bf3e600b42c889163508cee94894, '2025-11-13 21:52:28.000000', 'ORD-1763070748509', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 166.65, '2025-11-13 21:52:28.000000', 0x123e4567e89b12d3a456426614174000),
(0xbd473e0198ae45328be725b6c39441b9, '2025-11-13 22:11:26.000000', 'ORD-1763071886647', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 222.20, '2025-11-13 22:11:26.000000', 0x123e4567e89b12d3a456426614174000),
(0xd18496c110d84934be1f5b59e490cc42, '2025-11-13 21:16:33.000000', 'ORD-1763068593250', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 66.66, '2025-11-13 21:16:33.000000', 0x123e4567e89b12d3a456426614174000),
(0xf3d5871115dd467193663bc3af2f9821, '2025-11-13 20:49:43.000000', 'ORD-1763066983377', '123 Main St', 'Casablanca', 'Morocco', 'Test User', '+212600000000', '20000', 'CONFIRMED', 177.76, '2025-11-13 20:49:43.000000', 0x123e4567e89b12d3a456426614174000);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` binary(16) NOT NULL,
  `product_id` binary(16) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(38,2) NOT NULL,
  `order_id` binary(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `product_id`, `product_name`, `quantity`, `unit_price`, `order_id`) VALUES
(0x010dad4c768a4bcd953ad4ec6b20cf9d, 0x711ff7aaf9df4b9a92581e55d65134b0, 'The 3 Product', 2, 33.33, 0xa3330a57afe4413c9c200960c7d09b43),
(0x2d1321b6026342a4be332e0f6b1a6463, 0xb7d5f22aa8e7489297a9603a8ac8f87d, 'The 4 Product', 5, 44.44, 0xbd473e0198ae45328be725b6c39441b9),
(0x2d7d591426b44482a0a91cf34e249306, 0x711ff7aaf9df4b9a92581e55d65134b0, 'The 3 Product', 2, 33.33, 0xd18496c110d84934be1f5b59e490cc42),
(0x36eba54130e84a3093c2696d1d990667, 0x711ff7aaf9df4b9a92581e55d65134b0, 'The 3 Product', 5, 33.33, 0xae82bf3e600b42c889163508cee94894),
(0x480a84dc40f147f68bd7ea83ca0f14fb, 0xb7d5f22aa8e7489297a9603a8ac8f87d, 'The 4 Product', 5, 44.44, 0x9c9085c85b2a4612b022d91f55d9a58b),
(0x48c92baf94554ebbade669e5e6f9efa9, 0xb7d5f22aa8e7489297a9603a8ac8f87d, 'The 4 Product', 4, 44.44, 0xf3d5871115dd467193663bc3af2f9821),
(0x4f10c492a6b9413bb8967757fde348d3, 0x711ff7aaf9df4b9a92581e55d65134b0, 'The 3 Product', 2, 33.33, 0x5cf43dbbe3fa4444a4191502b641c790),
(0xa17685db3b2d48dea367b9eeb7af0ccf, 0x711ff7aaf9df4b9a92581e55d65134b0, 'The 3 Product', 2, 33.33, 0x3483f04ebf9046f4bd666d32c939158f),
(0xb2860b93a78c455e824a010fd299cef7, 0x711ff7aaf9df4b9a92581e55d65134b0, 'The 3 Product', 2, 33.33, 0x73d5a7ae8e194996b5d09a0bddc8b96d);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK64t7ox312pqal3p7fg9o503c2` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKpcttvuq4mxppo8sxggjtn5i2c` (`cart_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKnthkiu7pgmnqnu86i2jyoe2v7` (`order_number`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
