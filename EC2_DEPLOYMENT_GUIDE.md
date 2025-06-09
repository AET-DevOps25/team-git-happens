# Team Git Happens - EC2 Deployment Guide

This guide outlines the steps to deploy the application to an EC2 instance using pre-built Docker images.

## Prerequisites

1. An EC2 instance with:
   - Docker and Docker Compose installed
   - Sufficient storage space
   - Proper security groups allowing inbound traffic on ports 80 (HTTP) and 22 (SSH)

2. Docker images pushed to a container registry (Docker Hub, ECR, etc.)

## Deployment Steps

### 1. Set Up the Deployment Directory

Connect to your EC2 instance via SSH:

```bash
ssh -i your-key.pem ec2-user@your-ec2-instance-ip
```

Create a deployment directory:

```bash
mkdir -p ~/team-git-happens
cd ~/team-git-happens
```

### 2. Create the Required Files

#### a. Create the docker-compose.prod.yml file

Copy the production docker-compose file to your EC2 instance.

#### b. Create MySQL Initialization Directory

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

#### c. Create Directories for Flyway Migrations

```bash
mkdir -p migrations/course migrations/auth migrations/review
```

Copy your migration SQL files to these directories if needed.

### 3. Create Environment Variables File

```bash
cat > .env << 'EOF'
# Docker Registry URL (replace with your registry URL)
DOCKER_REGISTRY=your-registry-url
IMAGE_TAG=latest

# Database Configuration
MYSQL_ROOT_PASSWORD=secure_password_here
DB_PASSWORD=secure_password_here
EOF
```

Update the `.env` file with your actual registry URL and secure passwords.

### 4. Deploy the Application

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Verify the Deployment

Check if all containers are running:

```bash
docker-compose -f docker-compose.prod.yml ps
```

Check the logs for any issues:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. Access the Application

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
