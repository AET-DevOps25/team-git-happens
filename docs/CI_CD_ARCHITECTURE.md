# CI/CD Pipeline Architecture

## 🏗️ **Pipeline Architecture**

We use a **separated CI/CD approach** with distinct pipelines for different deployment targets:

### 🔧 **CI Pipeline** (`ci.yml`)
**Purpose**: Continuous Integration - Test and Build
**Triggers**: 
- Push to `main`, `develop` branches
- Pull requests to `main` or `develop`

**Workflow**:
1. **Test Phase**: 
   - Frontend tests (Jest, linting)
   - Backend tests (JUnit for all Spring Boot services)
2. **Build Phase** (only for specific branches):
   - Build JAR files for all Spring Boot services
   - Build and push Docker images to GHCR with `${GITHUB_SHA}` tags
   - Images: client, course, authentication, review, recommendation-gateway, genai-service

### ☁️ **Cloud CD Pipeline** (`cd-ec2.yml`)
**Purpose**: Continuous Deployment to AWS Cloud Infrastructure
**Name**: "Continuous Deployment on Cloud"
**Triggers**:
- Push to `main`, `develop` branches
- Manual dispatch (workflow_dispatch)

**Environments**: `staging` | `prod` (dev removed)

**Workflow**:
1. **Infrastructure Phase** (Terraform):
   - Provision AWS EC2 infrastructure using environment-specific tfvars
   - Configure VPC, security groups, and networking
   - Use `staging.tfvars` or `prod.tfvars` based on branch/input
2. **Deployment Phase** (Ansible):
   - Install Docker and dependencies on EC2
   - Login to GHCR and pull images with specific SHA tags
   - Deploy using `docker-compose.prod.yml`
   - Perform health checks

###  **Kubernetes CD Pipeline** (`KubernetesCD.yml`)
**Purpose**: Continuous Deployment of microservices to Kubernetes using Helm

**Name**: "Kubernetes Continuous Deployment"

**Triggers**:
- Manual dispatch (`workflow_dispatch`) with inputs:
  - `environment`: `staging` | `prod`
  - `image_tag`: Docker tag (default: `latest`)

**Environments**: `staging` | `prod`

**Workflow**:
1. **Setup Phase**:
   - Checkout repo, set up `kubectl` & `helm`
   - Configure kubeconfig using secret

2. **Pre-Cleanup**:
   - Uninstall existing MySQL release (if any)

3. **Deployment Phase**:
   - Deploy Bitnami MySQL chart with custom values
   - Deploy services:
     - `client-app`, `authentication-service`, `course-service`
     - `review-service`, `recommendation-gateway`, `genai-service`
     - All via Helm with `image.tag` from input
   - Apply unified ingress from `k8s/unified-ingress.yaml`

4. **Verification**:
   - Check ingress status via `kubectl get/describe`



## 🎯 **Advantages of Separated Pipelines**

### ✅ **Benefits**:
1. **Faster Feedback**: CI runs quickly on every change
2. **Better Security**: CD has restricted deployment permissions
3. **Clearer Separation**: Testing vs. deployment concerns
4. **Reusable Artifacts**: Build once, deploy to multiple environments
5. **Independent Control**: Deploy when ready, not on every commit
6. **Easier Debugging**: Smaller, focused pipelines
7. **Cost Effective**: Don't rebuild images for every deployment

### 🔄 **Workflow Flow**:
```
Code Push → CI Pipeline → Build Images → CD Pipeline → Deploy to Environment
     ↓           ↓            ↓              ↓              ↓
   Tests     Build Pass    Push GHCR    Provision     Deploy App
```

## 🌍 **Environment Strategy**

### **Branch-Based Deployments**:
- **`main` branch** → Automatic deployment to **prod** environment
- **`develop` branch** → Automatic deployment to **staging** environment

### **Manual Cloud Deployments**:
- Use GitHub Actions UI: "Continuous Deployment on Cloud"
- Deploy any commit SHA to staging or prod
- Useful for hotfixes, rollbacks, or testing specific builds

### **Image Tagging Strategy**:
- All images tagged with commit SHA (`${GITHUB_SHA}`) for immutable deployments
- No `latest` tags used to ensure reproducible deployments
- Example: `ghcr.io/aet-devops25/team-git-happens/client:a1b2c3d...`

## 🛠️ **Pipeline Triggers**

### CI Pipeline Triggers:
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### Cloud CD Pipeline Triggers:
```yaml
on:
  push:
    branches: [ main, develop ]
    paths-ignore: ['README.md', 'docs/**', '*.md']
  workflow_dispatch:  # Manual cloud deployment
    inputs:
      environment: [staging, prod]
      image_tag: string
      destroy: boolean
```

## 🎮 **Manual Cloud Deployment Usage**

1. Go to **Actions** tab in GitHub
2. Select **"Continuous Deployment on Cloud"**
3. Click **"Run workflow"**
4. Choose:
   - **Environment**: `staging` or `prod`
   - **Image Tag**: `latest`, `staging`, or specific commit SHA
   - **Destroy**: Option to tear down AWS infrastructure

## 🔧 **Current Architecture Details**

### **Services Deployed**:
- **Frontend**: React client with Nginx reverse proxy
- **Backend Services**: 
  - Course Service (Spring Boot)
  - Authentication Service (Spring Boot)  
  - Review Service (Spring Boot)
  - Recommendation Gateway (Spring Boot)
  - GenAI Service (Python/FastAPI)
- **Database**: Containerized MySQL with Flyway migrations

### **Cloud Infrastructure**:
- **Provider**: AWS
- **Compute**: EC2 instances (t2.micro/t3.small)
- **Networking**: VPC with security groups
- **Storage**: EBS volumes
- **Container Runtime**: Docker with Docker Compose

## 📊 **Pipeline Comparison**

| Aspect | Monolithic Pipeline | Separated CI/CD |
|--------|-------------------|-----------------|
| **Speed** | Slower (tests + build + deploy) | Faster CI, controlled CD |
| **Security** | Mixed permissions | Separate permissions |
| **Reusability** | Rebuild every time | Reuse built images |
| **Control** | Deploy on every merge | Deploy when ready |
| **Debugging** | Complex, long logs | Clear, focused logs |
| **Cost** | Higher (unnecessary rebuilds) | Lower (build once) |

## 🏃‍♂️ **Getting Started**

### For Development:
1. Create feature branch: `git checkout -b feature/my-feature`
2. Push changes → CI runs automatically (tests + builds images)
3. Merge to `develop` → CI builds + CD deploys to staging environment

### For Production:
1. Merge to `main` → CI builds + CD deploys to prod environment
2. Or manually deploy specific commit SHA via "Continuous Deployment on Cloud" workflow

### **Deployment Flow**:
```
Feature Branch → CI (test only)
      ↓
Main/Develop → CI (test + build + push) → CD Cloud (deploy)
      ↓              ↓                        ↓
   Tests Pass    Push to GHCR           Deploy to AWS
```

## 🔮 **Future Enhancements**

### **Kubernetes Pipeline** (Planned):
- Separate CD pipeline for Kubernetes deployments
- Container orchestration with auto-scaling
- Service mesh integration
- Advanced deployment strategies (blue-green, canary)

## 🔧 **Alternative Approaches**

### **Monolithic Pipeline**:
If you prefer a single pipeline that handles everything, you can combine CI and CD into one workflow. However, we **strongly recommend the separated approach** for:
- Better security isolation
- Faster feedback loops  
- Independent deployment control
- Cost efficiency (build once, deploy many times)

### **Direct Docker Deployment**:
For simpler setups, you can skip Terraform/Ansible and use Docker directly on a pre-configured server. This approach is documented in the deployment guides but lacks infrastructure-as-code benefits.
