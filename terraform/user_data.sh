#!/bin/bash
set -e

# Update the system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Create application directory
mkdir -p /opt/course-compass
cd /opt/course-compass

# Create environment file
cat > .env << EOF
DB_USERNAME=${db_username}
DB_PASSWORD=${db_password}
MYSQL_ROOT_PASSWORD=${db_password}
IMAGE_TAG=${image_tag}
ENVIRONMENT=${environment}
EOF

# Create docker-compose override for production
cat > docker-compose.override.yml << 'EOF'
version: '3.8'
services:
  db:
    environment:
      MYSQL_DATABASE: course_compass
    ports: []  # Remove external port exposure for security
  
  course-service:
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_server:3306/course_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
  
  authentication-service:
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_server:3306/auth_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
  
  review-service:
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_server:3306/review_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
EOF

# Set proper permissions
chown -R ec2-user:ec2-user /opt/course-compass

# Create systemd service for the application
cat > /etc/systemd/system/course-compass.service << 'EOF'
[Unit]
Description=Course Compass Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/course-compass
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=ec2-user
Group=ec2-user

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl enable course-compass.service

# Log completion
echo "User data script completed at $(date)" >> /var/log/user-data.log
