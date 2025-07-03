# Deployment Scripts

This directory contains helper scripts for deploying and managing the Course Compass application on AWS.

## Scripts Overview

### 🚀 `deploy.sh`
**Main deployment automation script**

```bash
# Check prerequisites
./scripts/deploy.sh check

# Deploy complete stack (infrastructure + application)
./scripts/deploy.sh deploy dev
./scripts/deploy.sh deploy prod

# Deploy only infrastructure
./scripts/deploy.sh infra dev

# Configure application only (after infrastructure exists)
./scripts/deploy.sh config dev

# Check deployment status
./scripts/deploy.sh status

# Show Terraform outputs
./scripts/deploy.sh outputs

# Destroy infrastructure
./scripts/deploy.sh destroy dev
```

### ✅ `validate.sh`
**Deployment validation and health checks**

```bash
# Run all validation checks
./scripts/validate.sh

# Check specific components
./scripts/validate.sh prereq      # Prerequisites
./scripts/validate.sh infra       # Infrastructure
./scripts/validate.sh connect     # Connectivity
./scripts/validate.sh app         # Application health
./scripts/validate.sh db          # Database connectivity
./scripts/validate.sh docker      # Docker services

# Generate detailed report
./scripts/validate.sh report
```

## 🗄️ Database Migrations

Database migrations are handled **automatically** by the Spring Boot services using Flyway. When each service starts, it will apply any necessary database schema changes before the application becomes available.

There are no manual migration scripts to run.

## Prerequisites

### Required Tools
- **AWS CLI** (configured with credentials)
- **Terraform** ≥ 1.6.0
- **Ansible** ≥ 8.0.0
- **Docker** (for local testing)
- **jq** (for JSON processing)
- **nc/netcat** (for connectivity testing)

### Required Files
- SSH private key at `~/.ssh/devops_kp.pem` (or update key name in scripts)
- Terraform configuration in `../terraform/`
- Ansible playbooks in `../ansible/`

### Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_SESSION_TOKEN="your-session-token" # If using temporary credentials
export DB_PASSWORD="your-database-password"
export MYSQL_ROOT_PASSWORD="your-mysql-root-password"
```

## Usage Patterns

### Initial Deployment
```bash
# 1. Check prerequisites
./scripts/deploy.sh check

# 2. Deploy the 'dev' environment
./scripts/deploy.sh deploy dev

# 3. Validate the deployment
./scripts/validate.sh
```

### Updating an Existing Deployment
```bash
# 1. Make changes to your application or infrastructure code

# 2. Re-run the deployment
./scripts/deploy.sh deploy dev

# 3. Validate the changes
./scripts/validate.sh
```

### Destroying an Environment
```bash
# Destroy all resources in the 'dev' environment
./scripts/deploy.sh destroy dev
```

## Script Features

### Error Handling
- Colored output for better visibility
- Comprehensive error checking
- Rollback capabilities
- Detailed logging

### Safety Features
- Confirmation prompts for destructive operations
- Environment validation
- Dependency checking
- State verification

### Automation
- Auto-detection of Terraform outputs
- Dynamic inventory generation for Ansible
- Health checks and validation
- Status reporting

## Common Issues

### Permission Errors
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Check AWS permissions
aws sts get-caller-identity
```

### SSH Connection Issues
```bash
# Verify key exists and has correct permissions
ls -la ~/.ssh/devops_kp.pem
chmod 600 ~/.ssh/devops_kp.pem

# Test SSH connectivity
ssh -i ~/.ssh/devops_kp.pem ec2-user@INSTANCE_IP
```

### Database Connection Issues
```bash
# Check if RDS is accessible
./scripts/validate.sh db

# Verify security groups allow connections
# Check if migrations have been run
./scripts/migrate-db.sh status RDS_ENDPOINT PASSWORD
```

## Integration with CI/CD

These scripts are designed to work with the GitHub Actions workflows:

- **CI Pipeline** (`.github/workflows/ci.yml`): Automated testing and building
- **CD Pipeline** (`.github/workflows/deploy.yml`): Uses these scripts for deployment

### Manual Pipeline Trigger
```bash
# Using GitHub CLI
gh workflow run deploy.yml -f environment=prod -f destroy=false

# Or use the GitHub web interface
```

## Monitoring and Logs

### Application Logs
```bash
# On EC2 instances
sudo docker logs client_app
sudo docker logs course_service_app
sudo journalctl -u course-compass.service -f
```

### Infrastructure Logs
```bash
# Terraform logs
terraform plan -detailed-exitcode
terraform show

# CloudWatch logs (if configured)
aws logs describe-log-groups
```

## Security Notes

- Scripts handle sensitive data (passwords, keys) securely
- Use environment variables for secrets
- SSH keys should have restricted permissions (600)
- Database passwords should be strong and unique
- Consider using AWS Secrets Manager for production

## Support

For issues with these scripts:
1. Check the troubleshooting section above
2. Run validation script for diagnostics
3. Check application logs
4. Review GitHub Actions workflow logs
5. Create an issue in the repository

---
**Team Git Happens** - Course Compass Deployment Tools
