#!/bin/bash
# Script to set up the deployment environment on EC2

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Team Git Happens deployment on EC2...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    
    # For Amazon Linux 2
    if [ -f /etc/system-release ] && grep -q "Amazon Linux" /etc/system-release; then
        sudo yum update -y
        sudo amazon-linux-extras install docker -y
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -a -G docker $USER
    # For Ubuntu
    elif [ -f /etc/lsb-release ] && grep -q "Ubuntu" /etc/lsb-release; then
        # Add Docker's official GPG key
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl
        sudo install -m 0755 -d /etc/apt/keyrings
        sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        sudo chmod a+r /etc/apt/keyrings/docker.asc
        
        # Add the repository to Apt sources
        echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Add current user to docker group
        sudo usermod -a -G docker ubuntu
        sudo usermod -a -G docker $USER
    else
        echo -e "${RED}Unsupported OS. Please install Docker manually.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
fi

# Note about user permissions
echo -e "${YELLOW}NOTE: You may need to log out and log back in for Docker permissions to take effect.${NC}"
echo -e "${YELLOW}If you encounter permission issues, run: newgrp docker${NC}"

# Create required directories
echo -e "${YELLOW}Creating required directories...${NC}"
mkdir -p mysql-init migrations/course migrations/auth migrations/review

# Create placeholder migration files with instructions
echo -e "${YELLOW}Creating migration placeholder files...${NC}"
cat > migrations/README.md << 'EOF'
# Database Migrations

## Important

You need to copy your Flyway SQL migration files to these directories:

- migrations/course/ - Course service migrations
- migrations/auth/ - Authentication service migrations  
- migrations/review/ - Review service migrations

From your local environment, use:

```bash
scp -i your-key.pem /path/to/local/migrations/*.sql ec2-user@your-ec2-instance-ip:~/team-git-happens/migrations/service-name/
```
EOF

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

# Create docker-compose.prod.yml file
echo -e "${YELLOW}Creating docker-compose.prod.yml file...${NC}"
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: mysql_server
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: '${MYSQL_ROOT_PASSWORD:-githappens!}'  # Use environment variable or default
    ports:
      - "3306:3306"  # Only expose if needed for external access
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d  # Only needs the init scripts
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p${MYSQL_ROOT_PASSWORD:-githappens!}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  client-app:
    image: ghcr.io/aet-devops25/team-git-happens/client:${IMAGE_TAG:-latest}  # Your pre-built client image
    container_name: client_app
    restart: always
    ports:
      - "80:80"  # Map to standard HTTP port for production
    networks:
      - app_network
    depends_on:
      - course-service
      - authentication-service
      - review-service

  course-service:
    image: ghcr.io/aet-devops25/team-git-happens/course:${IMAGE_TAG:-latest}  # Your pre-built image
    container_name: course_service_app
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_server:3306/course_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-githappens!}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_FLYWAY_ENABLED: true
      SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: org.hibernate.dialect.MySQLDialect
    networks:
      - app_network

  authentication-service:
    image: ghcr.io/aet-devops25/team-git-happens/authentication:${IMAGE_TAG:-latest}  # Your pre-built image
    container_name: authentication_service_app
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_server:3306/auth_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-githappens!}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_FLYWAY_ENABLED: true
      SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: org.hibernate.dialect.MySQLDialect
    networks:
      - app_network

  review-service:
    image: ghcr.io/aet-devops25/team-git-happens/review:${IMAGE_TAG:-latest}  # Your pre-built image
    container_name: review_service_app
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_server:3306/review_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-githappens!}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_FLYWAY_ENABLED: true
      SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: org.hibernate.dialect.MySQLDialect
    networks:
      - app_network
      
  # recommendation-gateway:
  #   image: ghcr.io/aet-devops25/team-git-happens/recommendation-gateway:${IMAGE_TAG:-latest}
  #   container_name: recommendation_gateway
  #   restart: always
  #   environment:
  #     SERVER_PORT: 8080
  #   networks:
  #     - app_network
  #   depends_on:
  #     - genai-service
      
  # genai-service:
  #   image: ghcr.io/aet-devops25/team-git-happens/genai-service:${IMAGE_TAG:-latest}
  #   container_name: genai_service
  #   restart: always
  #   environment:
  #     HF_TOKEN: ${HF_TOKEN:-sample_token}  # Use environment variable or default
  #   networks:
  #     - app_network
      
  recommendation-gateway:
    image: ${DOCKER_REGISTRY}/team-git-happens-recommendation-gateway:${IMAGE_TAG:-latest}
    container_name: recommendation_gateway
    restart: always
    environment:
      SERVER_PORT: 8080
    networks:
      - app_network
    depends_on:
      - genai-service
      
  genai-service:
    image: ${DOCKER_REGISTRY}/team-git-happens-genai-service:${IMAGE_TAG:-latest}
    container_name: genai_service
    restart: always
    environment:
      HF_TOKEN: ${HF_TOKEN:-sample_token}  # Use environment variable or default
    networks:
      - app_network

  # Flyway migration containers - for the first deployment or migrations
  flyway_course:
    image: flyway/flyway:9
    command: migrate
    depends_on:
      db:
        condition: service_healthy
    environment:
      FLYWAY_URL: jdbc:mysql://mysql_server:3306/course_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      FLYWAY_USER: admin
      FLYWAY_PASSWORD: ${DB_PASSWORD:-githappens!}
      FLYWAY_CLEAN_DISABLED: "true"  # For production, disable clean
    volumes:
      - ./migrations/course:/flyway/sql  # Directory to store SQL migration files
    networks:
      - app_network

  flyway_authentication:
    image: flyway/flyway:9
    command: migrate
    depends_on:
      db:
        condition: service_healthy
    environment:
      FLYWAY_URL: jdbc:mysql://mysql_server:3306/auth_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      FLYWAY_USER: admin
      FLYWAY_PASSWORD: ${DB_PASSWORD:-githappens!}
      FLYWAY_CLEAN_DISABLED: "true"
    volumes:
      - ./migrations/auth:/flyway/sql  # Directory to store SQL migration files
    networks:
      - app_network

  flyway_review:
    image: flyway/flyway:9
    command: migrate
    depends_on:
      db:
        condition: service_healthy
    environment:
      FLYWAY_URL: jdbc:mysql://mysql_server:3306/review_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      FLYWAY_USER: admin
      FLYWAY_PASSWORD: ${DB_PASSWORD:-githappens!}
      FLYWAY_CLEAN_DISABLED: "true"
    volumes:
      - ./migrations/review:/flyway/sql  # Directory to store SQL migration files
    networks:
      - app_network

networks:
  app_network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
EOF

# Create environment variables file template
echo -e "${YELLOW}Creating environment file template...${NC}"
cat > .env << 'EOF'
# Image Tag Configuration
IMAGE_TAG=latest

# Database Configuration (CHANGE THESE IN PRODUCTION)
MYSQL_ROOT_PASSWORD=secure_password_here
DB_PASSWORD=secure_password_here

# Hugging Face API Token
HF_TOKEN=your_huggingface_token_here
EOF

# Create script to download SQL migrations from GitHub
echo -e "${YELLOW}Creating script to download migrations from GitHub...${NC}"
cat > download_migrations.sh << 'EOF'
#!/bin/bash
# Script to download database migration files from GitHub

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub repository information
echo -e "${YELLOW}Please enter your GitHub username:${NC}"
read github_user

echo -e "${YELLOW}Please enter the repository name (e.g., team-git-happens):${NC}"
read repo_name

echo -e "${YELLOW}Please enter the branch name (e.g., main):${NC}"
read branch_name

echo -e "${YELLOW}Downloading migration files from GitHub...${NC}"

# Create temporary directory
mkdir -p temp_migrations

# Download migration files for each service
services=("course" "authentication" "review")
for service in "${services[@]}"; do
  echo -e "${YELLOW}Downloading $service service migrations...${NC}"
  
  # Create URL for raw GitHub content
  base_url="https://raw.githubusercontent.com/$github_user/$repo_name/$branch_name/server/$service-service/src/main/resources/db/migration"
  
  # Try to get a file listing using curl (this is a workaround as GitHub doesn't allow directory listing)
  # We just try to download V1, V2, V3, etc. SQL files
  for i in {1..10}; do
    file_url="$base_url/V${i}__*.sql"
    echo "Trying to find $file_url"
    curl --silent --fail --location "$file_url" -o "temp_migrations/${service}_V${i}.sql" && echo "Downloaded V${i} migration for $service" || true
  done
done

# Move files to their correct locations
echo -e "${YELLOW}Moving files to migration directories...${NC}"
for service in "${services[@]}"; do
  if [ "$service" == "authentication" ]; then
    target_dir="auth"
  else
    target_dir="$service"
  fi
  
  cp temp_migrations/${service}_*.sql migrations/$target_dir/ 2>/dev/null || echo "No migrations found for $service"
done

# Clean up
rm -rf temp_migrations

echo -e "${GREEN}Migration download attempt complete.${NC}"
echo -e "${YELLOW}Note: This script attempts to download migrations but might not get them all.${NC}"
echo -e "${YELLOW}If your services fail to start, please manually upload migration files to the migrations directories.${NC}"
EOF

chmod +x download_migrations.sh

# Add GitHub Container Registry login script
echo -e "${YELLOW}Creating GitHub Container Registry login script...${NC}"
cat > github_login.sh << 'EOF'
#!/bin/bash
# Script to log in to GitHub Container Registry

echo "Logging into GitHub Container Registry..."
echo "Please enter your GitHub username:"
read username

echo "Please enter your GitHub Personal Access Token (with packages:read scope):"
read -s token

echo "$token" | docker login ghcr.io -u "$username" --password-stdin

if [ $? -eq 0 ]; then
  echo "Login successful!"
else
  echo "Login failed. Please check your credentials and try again."
fi
EOF

chmod +x github_login.sh

echo -e "${GREEN}Setup complete! Please follow these steps:${NC}"
echo -e "${YELLOW}1. Edit the .env file with your secure passwords and API tokens${NC}"
echo -e "${YELLOW}2. Run ./github_login.sh to authenticate with GitHub Container Registry${NC}" 
echo -e "${YELLOW}3. Optional: Run ./download_migrations.sh to attempt to download migrations${NC}"
echo -e "${YELLOW}   or manually copy migration files to migrations/{course|auth|review} directories${NC}"
echo -e "${YELLOW}4. Run: docker-compose -f docker-compose.prod.yml up -d${NC}"
