# Team Git Happens - EC2 Deployment Guide

This guide outlines the steps to deploy the application to an EC2 instance using pre-built Docker images.

## Prerequisites

1. An EC2 instance with:
   - Sufficient storage space
   - Proper security groups allowing inbound traffic on ports 80 (HTTP) and 22 (SSH)

2. Docker images pushed to a container registry (GitHub Container Registry in our case)

## Initial Setup

### 1. Install Docker and Docker Compose

Connect to your EC2 instance and install Docker:

For Amazon Linux 2:

```bash
# Update package index
sudo yum update -y

# Install Docker
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

For Ubuntu:

```bash
# Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -a -G docker ubuntu

# Log out and log back in for group changes to take effect
# or use the following command to apply changes in current session
newgrp docker
```

Verify the installations:
```bash
docker --version
docker-compose --version
```

## Deployment Steps

### 2. Set Up the Deployment Directory

Connect to your EC2 instance via SSH:

```bash
ssh -i your-key.pem ec2-user@your-ec2-instance-ip
```

Create a deployment directory:

```bash
mkdir -p ~/team-git-happens
cd ~/team-git-happens
```

### 3. Set Up the Deployment Files

#### Option 1: Use the setup script (Recommended)

The setup script will create all necessary configuration files automatically:

```bash
curl -O https://raw.githubusercontent.com/your-username/team-git-happens/main/setup_ec2.sh
chmod +x setup_ec2.sh
./setup_ec2.sh
```

#### Option 2: Manual Setup 

If you prefer to copy files manually:

a. Copy the docker-compose.prod.yml file:

```bash
scp -i your-key.pem /path/to/docker-compose.prod.yml ec2-user@your-ec2-instance-ip:~/team-git-happens/
```

b. Create MySQL Initialization Directory:

```bash
mkdir -p mysql-init
```

Create the database initialization script:

```bash
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
```

#### c. Create Directories for Flyway Migrations and Copy SQL Files

```bash
mkdir -p migrations/course migrations/auth migrations/review
```

Copy your migration SQL files to these directories. These scripts are essential for setting up the database schema:

```bash
# From your local machine, copy the SQL files to the EC2 instance
# Replace {your-key.pem} and {your-ec2-instance-ip} with your actual values

# Course service migrations
scp -i your-key.pem \
    /path/to/team-git-happens/server/course-service/src/main/resources/db/migration/*.sql \
    ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/course/

# Authentication service migrations
scp -i your-key.pem \
    /path/to/team-git-happens/server/authentication-service/src/main/resources/db/migration/*.sql \
    ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/auth/

# Review service migrations
scp -i your-key.pem \
    /path/to/team-git-happens/server/review-service/src/main/resources/db/migration/*.sql \
    ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/review/
```

### 4. Create Environment Variables File

```bash
cat > .env << 'EOF'
# Image Tag Configuration
IMAGE_TAG=latest

# Database Configuration
MYSQL_ROOT_PASSWORD=secure_password_here
DB_PASSWORD=secure_password_here

# Hugging Face API Token for the GenAI service
HF_TOKEN=your_huggingface_token_here
EOF
```

Update the `.env` file with your secure passwords and Hugging Face token.

### 5. Authenticate with GitHub Container Registry

To pull images from GitHub Container Registry, you need to authenticate:

```bash
# Run the authentication script created by setup_ec2.sh
./github_login.sh

# Or authenticate manually
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

You'll need a GitHub Personal Access Token with the `packages:read` scope.

### 6. Handle Database Migration Files

Database migration files are essential for setting up the database schema. You have two options:

#### Option 1: Use the download script (if you used the setup script)
```bash
./download_migrations.sh
```
This will attempt to download migration files from your GitHub repository.

#### Option 2: Copy migration files manually

```bash
# From your local machine:
scp -i your-key.pem \
    /path/to/team-git-happens/server/course-service/src/main/resources/db/migration/*.sql \
    ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/course/

scp -i your-key.pem \
    /path/to/team-git-happens/server/authentication-service/src/main/resources/db/migration/*.sql \
    ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/auth/

scp -i your-key.pem \
    /path/to/team-git-happens/server/review-service/src/main/resources/db/migration/*.sql \
    ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/review/
```

### 7. Deploy the Application

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 8. Verify the Deployment

Check if all containers are running:

```bash
docker-compose -f docker-compose.prod.yml ps
```

Check the logs for any issues:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 9. Access the Application

The application should be accessible at:

```
http://your-ec2-instance-ip
```

## Common Operations

### Stop the Application

```bash
docker-compose -f docker-compose.prod.yml stop
```

### Update the Application

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f [service-name]
```

### Backup the Database

```bash
docker exec mysql_server mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" --all-databases > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Database Connection Issues

If services can't connect to the database:
- Check if the MySQL service is running
- Verify the database initialization script ran correctly
- Check the database password in the `.env` file

### Service Startup Failures

Check logs for specific errors:
```bash
docker-compose -f docker-compose.prod.yml logs -f service-name
```
