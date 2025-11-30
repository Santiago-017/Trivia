CREATE TABLE `users` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `email` varchar(100) UNIQUE,
  `password_hash` varchar(255),
  `role` varchar(10),
  `avatar_url` varchar(255),
  `created_at` timestamp,
  `last_login` timestamp
);

CREATE TABLE `sessions` (
  `session_id` int PRIMARY KEY AUTO_INCREMENT,
  `host_id` int NOT NULL,
  `game_code` varchar(10) UNIQUE NOT NULL,
  `category` varchar(100),
  `difficulty` varchar(10),
  `num_questions` int,
  `status` varchar(15),
  `created_at` timestamp,
  `started_at` timestamp,
  `ended_at` timestamp
);

CREATE TABLE `session_players` (
  `session_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp,
  `left_at` timestamp,
  `score` int DEFAULT 0,
  `active` boolean DEFAULT true,
  PRIMARY KEY (`session_id`, `user_id`)
);

CREATE TABLE `session_questions` (
  `session_question_id` int PRIMARY KEY AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `category` varchar(100),
  `difficulty` varchar(10),
  `time_limit` int,
  `question_order` int
);

CREATE TABLE `player_answers` (
  `answer_id` int PRIMARY KEY AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `session_question_id` int NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `is_correct` boolean,
  `response_time_ms` int,
  `answered_at` timestamp
);

CREATE TABLE `user_stats` (
  `user_id` int PRIMARY KEY,
  `games_played` int DEFAULT 0,
  `average_score` decimal(5,2) DEFAULT 0,
  `highest_score` int DEFAULT 0,
  `average_accuracy` decimal(5,2) DEFAULT 0,
  `total_play_time` int DEFAULT 0
);

CREATE TABLE `activity_logs` (
  `log_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `action` varchar(255),
  `session_id` int,
  `details` json,
  `timestamp` timestamp
);

ALTER TABLE `sessions` ADD FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `session_players` ADD FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`);

ALTER TABLE `session_players` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `session_questions` ADD FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`);

ALTER TABLE `player_answers` ADD FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`);

ALTER TABLE `player_answers` ADD FOREIGN KEY (`session_question_id`) REFERENCES `session_questions` (`session_question_id`);

ALTER TABLE `user_stats` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `activity_logs` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `activity_logs` ADD FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`);
