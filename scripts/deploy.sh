#!/bin/bash

# Course Compass Deployment Script
# Usage: ./deploy.sh [command] [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="course-compass"
TERRAFORM_DIR="terraform"
ANSIBLE_DIR="ansible"
DEFAULT_ENVIRONMENT="dev"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    local missing_deps=()
    
    # Check required tools
    command -v terraform >/dev/null 2>&1 || missing_deps+=("terraform")
    command -v ansible >/dev/null 2>&1 || missing_deps+=("ansible")
    command -v aws >/dev/null 2>&1 || missing_deps+=("aws-cli")
    command -v docker >/dev/null 2>&1 || missing_deps+=("docker")
    command -v jq >/dev/null 2>&1 || missing_deps+=("jq")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Install missing dependencies and try again"
        return 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        log_error "AWS credentials not configured. Run 'aws configure' first"
        return 1
    fi
    
    # Check Terraform files
    if [ ! -f "$TERRAFORM_DIR/main.tf" ]; then
        log_error "Terraform configuration not found in $TERRAFORM_DIR"
        return 1
    fi
    
    # Check Ansible files
    if [ ! -f "$ANSIBLE_DIR/playbook.yml" ]; then
        log_error "Ansible playbook not found in $ANSIBLE_DIR"
        return 1
    fi
    
    log_success "All dependencies checked successfully"
    return 0
}

setup_environment() {
    local env=${1:-$DEFAULT_ENVIRONMENT}
    
    log_info "Setting up environment: $env"
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
        log_warning "terraform.tfvars not found, creating from example..."
        if [ -f "$TERRAFORM_DIR/terraform.tfvars.example" ]; then
            cp "$TERRAFORM_DIR/terraform.tfvars.example" "$TERRAFORM_DIR/terraform.tfvars"
            log_warning "Please edit $TERRAFORM_DIR/terraform.tfvars with your values"
            return 1
        else
            log_error "terraform.tfvars.example not found"
            return 1
        fi
    fi
    
    # Validate environment file exists
    if [ ! -f "$TERRAFORM_DIR/${env}.tfvars" ]; then
        log_error "Environment file ${env}.tfvars not found in $TERRAFORM_DIR"
        return 1
    fi
    
    log_success "Environment $env setup completed"
}

deploy_infrastructure() {
    local env=${1:-$DEFAULT_ENVIRONMENT}
    
    log_info "Deploying infrastructure for environment: $env"
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log_info "Planning Terraform deployment..."
    terraform plan -var-file="${env}.tfvars" -out=tfplan
    
    # Apply deployment
    log_info "Applying Terraform deployment..."
    terraform apply tfplan
    
    # Save outputs
    terraform output -json > terraform-outputs.json
    
    log_success "Infrastructure deployment completed"
    cd ..
}

configure_application() {
    local env=${1:-$DEFAULT_ENVIRONMENT}
    
    log_info "Configuring application for environment: $env"
    
    # Get EC2 instance IPs from Terraform output
    local ec2_ips
    ec2_ips=$(cd "$TERRAFORM_DIR" && terraform output -json ec2_public_ips | jq -r '.[]')
    
    if [ -z "$ec2_ips" ]; then
        log_error "No EC2 instances found in Terraform output"
        return 1
    fi
    
    # Create Ansible inventory
    log_info "Creating Ansible inventory..."
    cat > "$ANSIBLE_DIR/inventory/hosts" << EOF
[ec2_instances]
$(echo "$ec2_ips" | while read -r ip; do echo "$ip ansible_user=ec2-user ansible_ssh_private_key_file=~/.ssh/devops_kp.pem"; done)

[ec2_instances:vars]
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF
    
    # Get RDS endpoint
    local rds_endpoint
    rds_endpoint=$(cd "$TERRAFORM_DIR" && terraform output -raw rds_endpoint)
    
    # Wait for instances to be ready
    log_info "Waiting for EC2 instances to be ready..."
    for ip in $ec2_ips; do
        log_info "Checking $ip..."
        while ! nc -z "$ip" 22; do
            sleep 10
        done
        log_success "$ip is ready"
    done
    
    # Run Ansible playbook
    log_info "Running Ansible playbook..."
    cd "$ANSIBLE_DIR"
    ansible-playbook -i inventory/hosts playbook.yml \
        -e "rds_endpoint=$rds_endpoint" \
        -e "image_tag=latest" \
        -e "environment=$env" \
        -v
    
    log_success "Application configuration completed"
    cd ..
}

check_deployment() {
    log_info "Checking deployment health..."
    
    # Get load balancer DNS from Terraform
    local alb_dns
    alb_dns=$(cd "$TERRAFORM_DIR" && terraform output -raw application_load_balancer_dns 2>/dev/null || echo "")
    
    if [ -n "$alb_dns" ]; then
        log_info "Checking load balancer health: $alb_dns"
        if curl -f "http://$alb_dns" >/dev/null 2>&1; then
            log_success "Load balancer is healthy"
        else
            log_warning "Load balancer health check failed"
        fi
    fi
    
    # Check individual instances
    local ec2_ips
    ec2_ips=$(cd "$TERRAFORM_DIR" && terraform output -json ec2_public_ips 2>/dev/null | jq -r '.[]' || echo "")
    
    if [ -n "$ec2_ips" ]; then
        for ip in $ec2_ips; do
            log_info "Checking instance health: $ip"
            if curl -f "http://$ip" >/dev/null 2>&1; then
                log_success "Instance $ip is healthy"
            else
                log_warning "Instance $ip health check failed"
            fi
        done
    fi
}

destroy_infrastructure() {
    local env=${1:-$DEFAULT_ENVIRONMENT}
    
    log_warning "This will destroy all infrastructure for environment: $env"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Destruction cancelled"
        return 0
    fi
    
    log_info "Destroying infrastructure..."
    cd "$TERRAFORM_DIR"
    terraform destroy -var-file="${env}.tfvars" -auto-approve
    cd ..
    
    log_success "Infrastructure destroyed"
}

show_outputs() {
    log_info "Terraform outputs:"
    cd "$TERRAFORM_DIR"
    
    if [ -f "terraform-outputs.json" ]; then
        echo "Load Balancer URL: http://$(jq -r '.application_load_balancer_dns.value' terraform-outputs.json)"
        echo "EC2 Instance IPs: $(jq -r '.ec2_public_ips.value[]' terraform-outputs.json | tr '\n' ' ')"
        echo "RDS Endpoint: $(jq -r '.rds_endpoint.value' terraform-outputs.json)"
    else
        terraform output
    fi
    cd ..
}

show_usage() {
    cat << EOF
Course Compass Deployment Script

Usage: $0 [command] [environment]

Commands:
    check       Check dependencies and prerequisites
    setup       Setup environment configuration
    deploy      Deploy infrastructure and application
    infra       Deploy only infrastructure (Terraform)
    config      Configure only application (Ansible)
    status      Check deployment status
    outputs     Show Terraform outputs
    destroy     Destroy infrastructure
    help        Show this help message

Environments:
    dev         Development environment (default)
    staging     Staging environment
    prod        Production environment

Examples:
    $0 check
    $0 deploy dev
    $0 infra prod
    $0 status
    $0 destroy dev

EOF
}

# Main script logic
main() {
    local command=${1:-help}
    local environment=${2:-$DEFAULT_ENVIRONMENT}
    
    case $command in
        check)
            check_dependencies
            ;;
        setup)
            setup_environment "$environment"
            ;;
        deploy)
            check_dependencies || exit 1
            setup_environment "$environment" || exit 1
            deploy_infrastructure "$environment"
            configure_application "$environment"
            check_deployment
            show_outputs
            ;;
        infra)
            check_dependencies || exit 1
            setup_environment "$environment" || exit 1
            deploy_infrastructure "$environment"
            show_outputs
            ;;
        config)
            check_dependencies || exit 1
            configure_application "$environment"
            check_deployment
            ;;
        status)
            check_deployment
            ;;
        outputs)
            show_outputs
            ;;
        destroy)
            destroy_infrastructure "$environment"
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
