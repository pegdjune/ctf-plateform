CREATE DATABASE IF NOT EXISTS userdb;
USE userdb;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter quelques données de test
INSERT INTO users (username, password_hash, email) VALUES
('admin', '$2y$10$encrypted_password_hash', 'admin@local.host'),
('user1', '$2y$10$another_encrypted_hash', 'user1@local.host');

CREATE USER IF NOT EXISTS 'dbuser'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT SELECT, INSERT, UPDATE ON userdb.* TO 'dbuser'@'%';
FLUSH PRIVILEGES;