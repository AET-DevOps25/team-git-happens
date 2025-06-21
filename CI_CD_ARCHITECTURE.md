# CI/CD Pipeline Architecture

## 🏗️ **Pipeline Architecture**

We use a **separated CI/CD approach** with two distinct pipelines:

### 🔧 **CI Pipeline** (`ci.yml`)
**Purpose**: Continuous Integration - Test and Build
**Triggers**: 
- Push to any branch (`main`, `develop`, `feature/*`)
- Pull requests to `main` or `develop`

**Workflow**:
1. **Test Phase**: 
   - Frontend tests (Jest, linting)
   - Backend tests (JUnit for all Spring Boot services)
2. **Build Phase** (only for `main`/`develop`):
   - Build and push Docker images to GHCR
   - Generate image tags based on branch/commit

### 🚀 **CD Pipeline** (`cd.yml`)
**Purpose**: Continuous Deployment - Infrastructure & Application Deployment
**Triggers**:
- Successful completion of CI pipeline (auto-deploy)
- Manual dispatch (for specific environments/tags)

**Workflow**:
1. **Infrastructure Phase** (Terraform):
   - Provision AWS EC2 infrastructure
   - Configure networking and security groups
2. **Deployment Phase** (Ansible):
   - Configure servers with Docker
   - Deploy application using pre-built images
   - Run database migrations
   - Perform health checks

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

### **Automatic Deployments**:
- **`develop` branch** → Automatic deployment to **dev** environment
- **`main` branch** → Automatic deployment to **prod** environment

### **Manual Deployments**:
- Use GitHub Actions UI to deploy any image tag to any environment
- Useful for hotfixes, rollbacks, or staging deployments

## 🛠️ **Pipeline Triggers**

### CI Pipeline Triggers:
```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main, develop ]
```

### CD Pipeline Triggers:
```yaml
on:
  workflow_run:
    workflows: ["CI - Continuous Integration"]
    types: [completed]
    branches: [ main, develop ]
  workflow_dispatch:  # Manual deployment
```

## 🎮 **Manual Deployment Usage**

1. Go to **Actions** tab in GitHub
2. Select **"CD - Continuous Deployment"**
3. Click **"Run workflow"**
4. Choose:
   - **Environment**: `dev`, `staging`, `prod`
   - **Image Tag**: `latest`, `develop`, specific commit SHA
   - **Destroy**: Option to tear down infrastructure

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
2. Push changes → CI runs automatically
3. Merge to `develop` → CI builds + CD deploys to dev environment

### For Production:
1. Merge `develop` to `main` → CI builds + CD deploys to prod environment
2. Or manually deploy specific image tag via GitHub Actions UI

## 🔧 **Alternative: Monolithic Pipeline**

If you prefer a single pipeline, we've kept your original approach as `deploy-monolithic.yml.backup`. 

To switch back:
1. Delete `ci.yml` and `cd.yml`
2. Rename `deploy-monolithic.yml.backup` to `deploy.yml`

However, we **strongly recommend the separated approach** for production environments.
