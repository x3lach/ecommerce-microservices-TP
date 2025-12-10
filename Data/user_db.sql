-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 10, 2025 at 04:39 PM
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
-- Database: `user_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` binary(16) NOT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `is_default` bit(1) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `user_id` binary(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `address_line1`, `city`, `country`, `is_default`, `label`, `postal_code`, `user_id`) VALUES
(0xa01dd08558e94079a08d73f223e8b58f, 'Rabat ya kawkab', 'Rabat', 'Morocco', b'1', 'Home', '30350', 0xbe5b0d82e3274d8ea6147ef978025a20);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','CLIENT','SELLER') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `full_name`, `password`, `role`) VALUES
(1, 'alice@example.com', 'Alice Example', NULL, NULL),
(2, 'Mehdi@example.com', 'el mehdi el wassi', NULL, NULL),
(3, 'ilias@gmail.com', 'Areski Ilias', '$2a$10$aea3.3bPBgKQ9QzJv1Rts.tT9rmudjmSshpNCJTq5kgDJV8cRLV66', 'CLIENT');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` binary(16) NOT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','CLIENT','SELLER') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `address_line1`, `city`, `country`, `email`, `full_name`, `password`, `phone`, `postal_code`, `role`) VALUES
(0x321ecfa721774c63a987f7ad377351b5, 'CASABLANCA', 'CASABLANCA', 'Morocco', 'anas@gmai.com', 'anas Areski', '$2a$10$7SRmwS5wmrrMS219kpjhI.hAzBD9qCwkTOZDxP0tKxr.6HlKB9d9i', '0777432697', '20250', 'CLIENT'),
(0x763b3d6ef8b945de9c5c190c4ca2fa27, 'CASABLANCA', 'CASABLANCA', 'Morocco', 'areski@gmail.com', 'Ilias Areski', '$2a$10$SJ0/zmWqVPx3I7RH/mx77eXkoVhvH7/QyWrLogpABeR8/NvrMSJoS', '0777432697', '20250', 'CLIENT'),
(0xbe5b0d82e3274d8ea6147ef978025a20, 'Idrissia 1 Rue 02 N37', 'CASABLANCA', 'Morocco', 'ilias@gmail.com', 'Areski Ilias', '$2a$10$ofRpVX/LYF4CdKTdpyPVi.75kbNtE2DOQ6doWXkcPjEC0R9O.jhFa', '0612345677', '20250', 'CLIENT');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
