#!/bin/bash

# Deployment Helper Script
# This script helps with local deployment and testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if ! command -v ansible &> /dev/null; then
        missing_tools+=("ansible")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo "Please install them before proceeding."
        exit 1
    fi
    
    print_status "All prerequisites are installed."
}

# Validate AWS credentials
check_aws_credentials() {
    print_status "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid."
        echo "Please run 'aws configure' or set up your AWS credentials."
        exit 1
    fi
    
    print_status "AWS credentials are valid."
}

# Deploy infrastructure
deploy_infrastructure() {
    local environment=${1:-dev}
    
    print_status "Deploying infrastructure for environment: $environment"
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        print_warning "Please edit terraform.tfvars with your values before proceeding."
        read -p "Press enter to continue after editing terraform.tfvars..."
    fi
    
    # Plan
    terraform plan -var-file="${environment}.tfvars" -out=tfplan
    
    # Apply with confirmation
    read -p "Do you want to apply this plan? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply tfplan
        print_status "Infrastructure deployed successfully!"
    else
        print_warning "Deployment cancelled."
        exit 0
    fi
    
    cd ..
}

# Configure application
deploy_application() {
    print_status "Deploying application with Ansible..."
    
    # Get EC2 IPs from Terraform
    cd terraform
    local ec2_ips=$(terraform output -json ec2_public_ips)
    cd ..
    
    # Create Ansible inventory
    mkdir -p ansible/inventory
    cat > ansible/inventory/hosts << EOF
[ec2_instances]
$(echo "$ec2_ips" | jq -r '.[] | . + " ansible_user=ec2-user"')

[ec2_instances:vars]
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF
    
    # Run Ansible playbook
    cd ansible
    ansible-playbook -i inventory/hosts playbook.yml \
        -e "image_tag=${IMAGE_TAG:-latest}" \
        --ask-vault-pass
    
    cd ..
    
    print_status "Application deployed successfully!"
}

# Destroy infrastructure
destroy_infrastructure() {
    local environment=${1:-dev}
    
    print_warning "This will destroy all infrastructure in the $environment environment."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd terraform
        terraform destroy -var-file="${environment}.tfvars" -auto-approve
        print_status "Infrastructure destroyed successfully!"
        cd ..
    else
        print_warning "Destruction cancelled."
    fi
}

# --- Terraform Outputs ---
outputs() {
    header "Terraform Outputs"
    cd "$TERRAFORM_DIR" || exit 1
    if [ ! -f ".terraform/terraform.tfstate" ]; then
        error "Terraform state not found. Run 'infra' or 'deploy' first."
        exit 1
    fi
    
    EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip)
    
    if [ -z "$EC2_PUBLIC_IP" ]; then
        warn "Could not retrieve EC2 Public IP. Infrastructure might not be fully up."
    else
        info "EC2 Public IP: $EC2_PUBLIC_IP"
        info "Application URL: http://$EC2_PUBLIC_IP:8080"
    fi
    cd - > /dev/null || exit
}

# --- Deployment Status ---
status() {
    header "Deployment Status"
    cd "$TERRAFORM_DIR" || exit 1
    if [ ! -f ".terraform/terraform.tfstate" ]; then
        warn "Terraform state not found. No infrastructure deployed."
        exit 0
    fi
    
    EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip 2>/dev/null)
    
    if [ -z "$EC2_PUBLIC_IP" ]; then
        error "EC2 instance IP not found in Terraform state. Deployment may have failed."
        exit 1
    fi
    
    info "Pinging EC2 instance at $EC2_PUBLIC_IP..."
    if nc -zv -w 5 "$EC2_PUBLIC_IP" 22 &> /dev/null; then
        success "SSH Port (22) is open on EC2 instance."
    else
        error "SSH Port (22) is not reachable on EC2 instance."
    fi

    if nc -zv -w 5 "$EC2_PUBLIC_IP" 8080 &> /dev/null; then
        success "Application Port (8080) is open on EC2 instance."
    else
        warn "Application Port (8080) is not reachable. The application might still be starting up."
    fi
    cd - > /dev/null || exit
}

# Show help
show_help() {
    echo "Course Compass Deployment Helper"
    echo
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo
    echo "Commands:"
    echo "  check         Check prerequisites and AWS credentials"
    echo "  deploy        Deploy infrastructure and application"
    echo "  infra         Deploy only infrastructure"
    echo "  app           Deploy only application"
    echo "  destroy       Destroy infrastructure"
    echo "  status        Show deployment status"
    echo "  help          Show this help message"
    echo
    echo "Environments:"
    echo "  dev           Development environment (default)"
    echo "  staging       Staging environment"
    echo "  prod          Production environment"
    echo
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 deploy dev"
    echo "  $0 infra prod"
    echo "  $0 destroy dev"
    echo "  $0 status"
}

# Main script logic
main() {
    local command=${1:-help}
    local environment=${2:-dev}
    
    case $command in
        check)
            check_prerequisites
            check_aws_credentials
            ;;
        deploy)
            check_prerequisites
            check_aws_credentials
            deploy_infrastructure "$environment"
            deploy_application
            get_status
            ;;
        infra)
            check_prerequisites
            check_aws_credentials
            deploy_infrastructure "$environment"
            ;;
        app)
            check_prerequisites
            deploy_application
            ;;
        destroy)
            check_prerequisites
            check_aws_credentials
            destroy_infrastructure "$environment"
            ;;
        status)
            get_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
