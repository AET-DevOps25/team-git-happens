#!/bin/bash

# Deployment Validation Script
# Comprehensive checks for Course Compass deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TERRAFORM_DIR="terraform"
TIMEOUT=30

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local checks_passed=0
    local total_checks=4
    
    # Check AWS CLI
    if aws sts get-caller-identity >/dev/null 2>&1; then
        log_success "AWS CLI configured"
        ((checks_passed++))
    else
        log_error "AWS CLI not configured"
    fi
    
    # Check Terraform
    if command -v terraform >/dev/null 2>&1; then
        log_success "Terraform available ($(terraform version | head -1))"
        ((checks_passed++))
    else
        log_error "Terraform not installed"
    fi
    
    # Check Docker
    if command -v docker >/dev/null 2>&1; then
        log_success "Docker available ($(docker --version))"
        ((checks_passed++))
    else
        log_error "Docker not installed"
    fi
    
    # Check required files
    if [ -f "$TERRAFORM_DIR/main.tf" ] && [ -f "ansible/playbook.yml" ]; then
        log_success "Deployment files present"
        ((checks_passed++))
    else
        log_error "Missing deployment files"
    fi
    
    if [ $checks_passed -eq $total_checks ]; then
        log_success "All prerequisites met ($checks_passed/$total_checks)"
        return 0
    else
        log_error "Prerequisites check failed ($checks_passed/$total_checks)"
        return 1
    fi
}

check_infrastructure() {
    log_info "Checking AWS infrastructure..."
    
    if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
        log_warning "Terraform state not found - infrastructure may not be deployed"
        return 1
    fi
    
    cd "$TERRAFORM_DIR"
    
    # Check if resources exist
    local resources=$(terraform state list 2>/dev/null | wc -l)
    if [ "$resources" -gt 0 ]; then
        log_success "Terraform state contains $resources resources"
        
        # Check specific resources
        if terraform state show aws_lb.main >/dev/null 2>&1; then
            log_success "Load balancer exists"
        else
            log_warning "Load balancer not found"
        fi
        
        if terraform state show aws_db_instance.main >/dev/null 2>&1; then
            log_success "RDS instance exists"
        else
            log_warning "RDS instance not found"
        fi
        
        local ec2_count=$(terraform state list | grep -c "aws_instance.app" || echo "0")
        if [ "$ec2_count" -gt 0 ]; then
            log_success "EC2 instances exist ($ec2_count)"
        else
            log_warning "No EC2 instances found"
        fi
    else
        log_error "No Terraform resources found"
        cd ..
        return 1
    fi
    
    cd ..
    return 0
}

check_connectivity() {
    log_info "Checking network connectivity..."
    
    if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
        log_warning "Cannot check connectivity - no Terraform state"
        return 1
    fi
    
    cd "$TERRAFORM_DIR"
    
    # Get outputs
    local alb_dns=$(terraform output -raw application_load_balancer_dns 2>/dev/null || echo "")
    local ec2_ips=$(terraform output -json ec2_public_ips 2>/dev/null | jq -r '.[]' 2>/dev/null || echo "")
    
    if [ -n "$alb_dns" ]; then
        log_info "Testing load balancer: $alb_dns"
        if curl -s --max-time $TIMEOUT "http://$alb_dns" >/dev/null; then
            log_success "Load balancer is responding"
        else
            log_warning "Load balancer not responding (may still be starting)"
        fi
    fi
    
    if [ -n "$ec2_ips" ]; then
        for ip in $ec2_ips; do
            log_info "Testing EC2 instance: $ip"
            
            # Test SSH connectivity
            if nc -z -w5 "$ip" 22 2>/dev/null; then
                log_success "SSH port accessible on $ip"
            else
                log_warning "SSH port not accessible on $ip"
            fi
            
            # Test HTTP connectivity
            if curl -s --max-time $TIMEOUT "http://$ip" >/dev/null; then
                log_success "HTTP responding on $ip"
            else
                log_warning "HTTP not responding on $ip"
            fi
        done
    fi
    
    cd ..
}

check_application_health() {
    log_info "Checking application health..."
    
    if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
        log_warning "Cannot check application - no Terraform state"
        return 1
    fi
    
    cd "$TERRAFORM_DIR"
    local alb_dns=$(terraform output -raw application_load_balancer_dns 2>/dev/null || echo "")
    cd ..
    
    if [ -z "$alb_dns" ]; then
        log_warning "No load balancer DNS found"
        return 1
    fi
    
    local base_url="http://$alb_dns"
    
    # Test main application
    log_info "Testing main application endpoint..."
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$base_url" || echo "000")
    
    if [ "$status_code" = "200" ]; then
        log_success "Application is healthy (HTTP $status_code)"
    elif [ "$status_code" = "000" ]; then
        log_error "Cannot connect to application"
    else
        log_warning "Application returned HTTP $status_code"
    fi
    
    # Test API endpoints (if accessible)
    local api_endpoints=("api/courses" "api/auth/health" "api/reviews")
    
    for endpoint in "${api_endpoints[@]}"; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$base_url/$endpoint" || echo "000")
        
        if [ "$status_code" = "200" ] || [ "$status_code" = "401" ]; then
            log_success "API endpoint /$endpoint responding (HTTP $status_code)"
        elif [ "$status_code" = "000" ]; then
            log_warning "Cannot connect to /$endpoint"
        else
            log_warning "API endpoint /$endpoint returned HTTP $status_code"
        fi
    done
}

check_database() {
    log_info "Checking database connectivity..."
    
    if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
        log_warning "Cannot check database - no Terraform state"
        return 1
    fi
    
    cd "$TERRAFORM_DIR"
    local rds_endpoint=$(terraform output -raw rds_endpoint 2>/dev/null || echo "")
    local ec2_ips=$(terraform output -json ec2_public_ips 2>/dev/null | jq -r '.[0]' 2>/dev/null || echo "")
    cd ..
    
    if [ -z "$rds_endpoint" ]; then
        log_warning "No RDS endpoint found"
        return 1
    fi
    
    if [ -z "$ec2_ips" ]; then
        log_warning "No EC2 instances found for database test"
        return 1
    fi
    
    log_info "Testing database connectivity via EC2 instance..."
    
    # Test if MySQL port is accessible from EC2
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
        -i ~/.ssh/devops_kp.pem ec2-user@"$ec2_ips" \
        "nc -z ${rds_endpoint%:*} 3306" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "Database port accessible from EC2"
    else
        log_warning "Database connectivity test failed (may be normal if key not configured)"
    fi
}

check_docker_services() {
    log_info "Checking Docker services on EC2 instances..."
    
    if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
        log_warning "Cannot check Docker services - no Terraform state"
        return 1
    fi
    
    cd "$TERRAFORM_DIR"
    local ec2_ips=$(terraform output -json ec2_public_ips 2>/dev/null | jq -r '.[]' 2>/dev/null || echo "")
    cd ..
    
    if [ -z "$ec2_ips" ]; then
        log_warning "No EC2 instances found"
        return 1
    fi
    
    for ip in $ec2_ips; do
        log_info "Checking Docker services on $ip..."
        
        # Check if we can SSH (skip if no key)
        if [ ! -f ~/.ssh/devops_kp.pem ]; then
            log_warning "SSH key not found - skipping Docker service check"
            continue
        fi
        
        local docker_status=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
            -i ~/.ssh/devops_kp.pem ec2-user@"$ip" \
            "sudo docker ps --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null" 2>/dev/null || echo "SSH_FAILED")
        
        if [ "$docker_status" = "SSH_FAILED" ]; then
            log_warning "Could not SSH to $ip"
        elif [ -n "$docker_status" ]; then
            local container_count=$(echo "$docker_status" | grep -c "Up" || echo "0")
            if [ "$container_count" -gt 0 ]; then
                log_success "$ip has $container_count running containers"
            else
                log_warning "$ip has no running containers"
            fi
        fi
    done
}

generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="deployment-validation-$(date '+%Y%m%d-%H%M%S').txt"
    
    {
        echo "Course Compass Deployment Validation Report"
        echo "Generated: $timestamp"
        echo "=========================================="
        echo
        
        if [ -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
            cd "$TERRAFORM_DIR"
            echo "INFRASTRUCTURE OUTPUTS:"
            echo "----------------------"
            terraform output 2>/dev/null || echo "No outputs available"
            echo
            cd ..
        fi
        
        echo "VALIDATION SUMMARY:"
        echo "------------------"
        echo "✓ Prerequisites: $(check_prerequisites >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        echo "✓ Infrastructure: $(check_infrastructure >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        echo "✓ Connectivity: $(check_connectivity >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        echo "✓ Application: $(check_application_health >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        echo "✓ Database: $(check_database >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        echo "✓ Docker Services: $(check_docker_services >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
        
    } > "$report_file"
    
    log_success "Validation report generated: $report_file"
}

show_usage() {
    cat << EOF
Deployment Validation Script for Course Compass

Usage: $0 [command]

Commands:
    all         Run all validation checks (default)
    prereq      Check prerequisites only
    infra       Check infrastructure only
    connect     Check connectivity only
    app         Check application health only
    db          Check database connectivity only
    docker      Check Docker services only
    report      Generate validation report
    help        Show this help message

Examples:
    $0              # Run all checks
    $0 app          # Check application health only
    $0 report       # Generate detailed report

EOF
}

main() {
    local command=${1:-all}
    
    echo "Course Compass Deployment Validation"
    echo "===================================="
    echo
    
    case $command in
        all)
            check_prerequisites
            echo
            check_infrastructure
            echo
            check_connectivity
            echo
            check_application_health
            echo
            check_database
            echo
            check_docker_services
            ;;
        prereq)
            check_prerequisites
            ;;
        infra)
            check_infrastructure
            ;;
        connect)
            check_connectivity
            ;;
        app)
            check_application_health
            ;;
        db)
            check_database
            ;;
        docker)
            check_docker_services
            ;;
        report)
            generate_report
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

main "$@"
