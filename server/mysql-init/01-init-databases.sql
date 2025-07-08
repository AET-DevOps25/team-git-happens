CREATE DATABASE IF NOT EXISTS course_db;
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS review_db;

-- Create admin user with environment variable password
-- This works in both Docker Compose and Kubernetes environments
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY '${MYSQL_ADMIN_PASSWORD}';
GRANT ALL PRIVILEGES ON course_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON auth_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON review_db.* TO 'admin'@'%';
FLUSH PRIVILEGES;