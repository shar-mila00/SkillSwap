-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 04, 2026 at 12:53 AM
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
-- Database: `skillswap_pro`
--

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(50) NOT NULL,
  `sessionId` varchar(50) NOT NULL,
  `senderId` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `timestamp` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(50) NOT NULL,
  `requesterId` varchar(50) NOT NULL,
  `providerId` varchar(50) NOT NULL,
  `skillId` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `endTime` time NOT NULL,
  `status` enum('Pending','Approved','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `notes` text NOT NULL,
  `requesterReviewed` tinyint(1) NOT NULL DEFAULT 0,
  `providerReviewed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `name`, `category`) VALUES
('s1', 'React Development', 'Programming'),
('s10', 'Logo Design', 'Design'),
('s2', 'Python Basics', 'Programming'),
('s3', 'UI Design', 'Design'),
('s4', 'Acoustic Guitar', 'Music'),
('s5', 'Digital Marketing', 'Marketing'),
('s6', 'French Level B2', 'Languages'),
('s7', 'Sushi Making', 'Cooking'),
('s8', 'Project Management', 'Business'),
('s9', 'TypeScript', 'Programming');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL DEFAULT '',
  `bio` text NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  `rating` decimal(3,2) NOT NULL DEFAULT 5.00,
  `reviewCount` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `location`, `bio`, `role`, `avatar`, `rating`, `reviewCount`) VALUES
('admin1', 'Admin', 'admin@skillswap.com', 'admin', 'Remote', 'Official Admin.', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 5.00, 0),
('u1', 'Alex Johnson', 'alex@example.com', 'password123', 'San Francisco, CA', 'Full-stack developer looking to pick up guitar.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 4.80, 12),
('u2', 'Sarah Chen', 'sarah@example.com', 'password123', 'Vancouver, BC', 'Passionate UI designer and sushi chef.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 4.90, 8),
('u3', 'Marc Dubois', 'marc@example.com', 'password123', 'Paris, FR', 'Native French speaker and marketing expert.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marc', 4.50, 5);

-- --------------------------------------------------------

--
-- Table structure for table `user_skills_offered`
--

CREATE TABLE `user_skills_offered` (
  `user_id` varchar(50) NOT NULL,
  `skill_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_skills_offered`
--

INSERT INTO `user_skills_offered` (`user_id`, `skill_id`) VALUES
('u1', 's1'),
('u1', 's2'),
('u2', 's3'),
('u3', 's6');

-- --------------------------------------------------------

--
-- Table structure for table `user_skills_requested`
--

CREATE TABLE `user_skills_requested` (
  `user_id` varchar(50) NOT NULL,
  `skill_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_skills_requested`
--

INSERT INTO `user_skills_requested` (`user_id`, `skill_id`) VALUES
('u1', 's4'),
('u2', 's1'),
('u3', 's2');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `senderId` (`senderId`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requesterId` (`requesterId`),
  ADD KEY `providerId` (`providerId`),
  ADD KEY `skillId` (`skillId`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_skills_offered`
--
ALTER TABLE `user_skills_offered`
  ADD PRIMARY KEY (`user_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `user_skills_requested`
--
ALTER TABLE `user_skills_requested`
  ADD PRIMARY KEY (`user_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`);

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`requesterId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`providerId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`);

--
-- Constraints for table `user_skills_offered`
--
ALTER TABLE `user_skills_offered`
  ADD CONSTRAINT `user_skills_offered_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skills_offered_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_skills_requested`
--
ALTER TABLE `user_skills_requested`
  ADD CONSTRAINT `user_skills_requested_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skills_requested_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
