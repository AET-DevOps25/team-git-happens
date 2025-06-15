#!/bin/bash
# Script to set up the deployment environment on EC2

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Team Git Happens deployment on EC2...${NC}"

# Create required directories
echo -e "${YELLOW}Creating required directories...${NC}"
mkdir -p mysql-init migrations/course migrations/auth migrations/review

# Create database initialization script
echo -e "${YELLOW}Creating MySQL initialization script...${NC}"
cat > mysql-init/01-init-databases.sql << 'EOF'
CREATE DATABASE IF NOT EXISTS course_db;
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS review_db;

CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'githappens!';
GRANT ALL PRIVILEGES ON course_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON auth_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON review_db.* TO 'admin'@'%';
FLUSH PRIVILEGES;
EOF

# Create environment variables file template
echo -e "${YELLOW}Creating environment file template...${NC}"
cat > .env << 'EOF'
# Docker Registry URL (replace with your registry URL)
DOCKER_REGISTRY=your-registry-url
IMAGE_TAG=latest

# Database Configuration (CHANGE THESE IN PRODUCTION)
MYSQL_ROOT_PASSWORD=secure_password_here
DB_PASSWORD=secure_password_here
EOF

echo -e "${GREEN}Setup complete! Please edit the .env file with your actual values before deploying.${NC}"
echo -e "${GREEN}Then run: docker-compose -f docker-compose.prod.yml up -d${NC}"
