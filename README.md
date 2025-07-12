# TUM Informatics Course Recommendation System

[![CI/CD Status](https://github.com/aet-devops25/team-git-happens/workflows/ci/badge.svg)](https://github.com/aet-devops25/team-git-happens/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Supported-green)](https://kubernetes.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-driven course recommendation system designed specifically for TUM Informatics Master students. The platform combines collaborative filtering with AI-powered content analysis to provide personalized course suggestions based on student preferences, peer reviews, and curriculum requirements.

## 🎯 Project Overview

Master students in TUM Informatics face challenges selecting suitable courses due to overwhelming options (100+ modules across specializations), lack of peer insights, and complex module handbooks. Our solution provides a comprehensive web-based platform that:

- **Collects user data** through TUM-ID authentication and course rating interfaces
- **Analyzes preferences** using hybrid filtering algorithms and LLM-powered content analysis
- **Generates personalized recommendations** matching student interests with curriculum requirements

## ✨ Key Features

### 🔐 Authentication System
- **JWT-based authentication** with TUM matriculation number and email login options
- **Secure password hashing** using Spring Security
- **Student profile management** with course enrollment tracking

### 📚 Course Management
- **Comprehensive course catalog** with 100+ TUM Informatics modules
- **Category-based organization** (AI, Robotics, Software Engineering, etc.)
- **Detailed course information** including credits, descriptions, and difficulty levels
- **Search and filtering capabilities** for easy course discovery

### ⭐ Review & Rating System
- **5-star rating system** for course evaluation
- **Written reviews** with structured feedback collection
- **Average rating calculation** with real-time updates
- **Student review history** and management dashboard

### 🤖 AI-Powered Recommendations
- **Hybrid recommendation engine** combining collaborative and content-based filtering
- **LLM integration** (GPT-4/LangChain) for semantic course analysis
- **RAG pipeline** for processing TUM module handbooks
- **Personalized suggestions** based on preferences and peer reviews

### 📊 Monitoring & Analytics
- **Prometheus metrics collection** across all microservices
- **Grafana dashboards** for system health and performance monitoring
- **Distributed tracing** with comprehensive logging
- **Alerting system** for proactive issue detection

## 🏗️ Architecture

### Microservices Design
The system follows a microservices architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │  Authentication │    │  Course Service │
│   (React/TS)    │    │    Service      │    │   (Spring Boot) │
│                 │    │  (Spring Boot)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────│     Gateway     │─────────────┘
                        │     (Nginx)     │
                        └─────────────────┘
                                 │
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  Review Service │    │  Recommendation │    │   GenAI Service │
    │  (Spring Boot)  │    │    Gateway      │    │   (FastAPI)     │
    │                 │    │  (Spring Boot)  │    │                 │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  MySQL Database │
                        │     Cluster     │
                        └─────────────────┘
```

### Directory Structure
```
team-git-happens/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route-based page components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript type definitions
│   │   └── hooks/             # Custom React hooks
│   ├── Dockerfile             # Multi-stage build configuration
│   └── nginx.conf             # Reverse proxy configuration
├── server/                     # Backend microservices
│   ├── authentication-service/ # User auth & JWT management
│   ├── course-service/        # Course catalog management
│   ├── review-service/        # Rating & review system
│   └── recommendation-gateway/ # AI recommendation orchestration
├── genai-service/             # Python AI/ML service
│   ├── main.py                # FastAPI application
│   ├── ChatWebUI.py           # LLM integration layer
│   └── requirements.txt       # Python dependencies
├── helm-charts/               # Kubernetes deployment manifests
├── k8s/                       # Additional K8s configurations
├── terraform/                 # AWS infrastructure as code
├── monitoring/                # Prometheus & Grafana configuration
├── ansible/                   # Configuration management
└── docs/                      # Project documentation
```

### Technology Stack

#### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **TailwindCSS** with Radix UI for modern, accessible components
- **React Router** for client-side routing
- **Zustand** for lightweight state management
- **React Query** for efficient server state management

#### Backend Services
- **Spring Boot 3.4** with Java 21 for robust microservices
- **Spring Security** for authentication and authorization
- **Spring Data JPA** with Flyway migrations
- **MySQL 8.0** for persistent data storage
- **JWT** for stateless authentication
- **OpenAPI/Swagger** for API documentation

#### AI/ML Service
- **FastAPI** for high-performance Python API
- **LangChain** for LLM orchestration and RAG pipelines
- **HuggingFace Transformers** for embeddings and NLP
- **FAISS** for efficient vector similarity search
- **Sentence Transformers** for semantic text analysis

#### Infrastructure & DevOps
- **Docker & Docker Compose** for containerization
- **Kubernetes** with Helm charts for orchestration
- **Nginx** for reverse proxy and load balancing
- **Prometheus & Grafana** for monitoring and observability
- **GitHub Actions** for CI/CD automation
- **Terraform** for AWS infrastructure provisioning
- **Ansible** for configuration management

## 🚀 Installation

### Prerequisites
- **Docker & Docker Compose** (v20.10+)
- **Node.js** (v18+) for local frontend development
- **Java 21** for local backend development
- **Python 3.9+** for AI service development
- **kubectl & Helm** (optional, for Kubernetes deployment)

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/aet-devops25/team-git-happens.git
   cd team-git-happens
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the complete stack**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **API Documentation**: http://localhost:8080/swagger-ui.html
   - **Grafana Dashboard**: http://localhost:3001 (admin/admin123)
   - **Prometheus**: http://localhost:9090

### Local Development Setup

#### Frontend Development
```bash
cd client
npm install
npm run dev          # Start development server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run build        # Create production build
```

#### Backend Development
```bash
cd server/[service-name]
./gradlew bootRun    # Start service locally
./gradlew test       # Run tests
./gradlew build      # Create JAR file
```

#### AI Service Development
```bash
cd genai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 💻 Usage

### User Registration & Authentication
1. Navigate to the registration page
2. Enter TUM matriculation number, name, email, and password
3. Login using either email or matriculation number
4. JWT token is automatically managed for authenticated sessions

### Course Discovery & Reviews
1. Browse the course catalog with filtering options
2. View detailed course information including descriptions and categories
3. Read peer reviews and average ratings
4. Submit your own reviews and ratings (authentication required)

### AI-Powered Recommendations
1. Access the recommendation page
2. Select preferred course categories
3. Specify credit preferences and additional interests
4. Receive personalized course suggestions with explanations
5. Explore recommended courses directly from results

### Common Commands
```bash
# Health check all services
curl http://localhost:3000/api/health

# Get course recommendations
curl -X POST http://localhost:3000/api/recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "credits": 10,
    "categories": ["Machine Learning"],
    "description": "interested in AI and data science"
  }'

# Submit a course review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": "IN2000",
    "rating": 5,
    "reviewText": "Excellent course!"
  }'
```

## 🔗 API Reference

### Authentication Service (`/api/auth`)

#### POST `/auth/register`
Register a new student account.
- **Request Body**: `{ matriculationNumber, name, email, password }`
- **Response**: `201 Created` with student details
- **Error Codes**: `400 Bad Request`, `409 Conflict`

#### POST `/auth/login/email`
Authenticate using email and password.
- **Request Body**: `{ email, password }`
- **Response**: `200 OK` with JWT token and student details
- **Error Codes**: `401 Unauthorized`

#### POST `/auth/login/matriculation`
Authenticate using matriculation number and password.
- **Request Body**: `{ matriculationNumber, password }`
- **Response**: `200 OK` with JWT token and student details
- **Error Codes**: `401 Unauthorized`

### Course Service (`/api/courses`)

#### GET `/courses`
Retrieve all available courses.
- **Response**: `200 OK` with array of course objects
- **Fields**: `id, title, description, categories, credits, avgRating`

#### GET `/courses/{id}`
Get detailed information for a specific course.
- **Parameters**: `id` (string) - Course identifier
- **Response**: `200 OK` with course details
- **Error Codes**: `404 Not Found`

#### GET `/categories`
List all available course categories.
- **Response**: `200 OK` with array of category objects

### Review Service (`/api/reviews`)

#### POST `/reviews`
Submit a new course review (authentication required).
- **Request Body**: `{ courseId, rating, reviewText }`
- **Response**: `201 Created` with review details
- **Authentication**: JWT token required

#### GET `/courses/{courseId}/reviews`
Get all reviews for a specific course.
- **Parameters**: `courseId` (string) - Course identifier
- **Response**: `200 OK` with array of review objects

#### GET `/courses/{courseId}/average-rating`
Calculate average rating for a course.
- **Parameters**: `courseId` (string) - Course identifier
- **Response**: `200 OK` with numeric rating value
- **Error Codes**: `404 Not Found` (no reviews)

### Recommendation Service (`/api/recommendation`)

#### POST `/recommendation`
Generate AI-powered course recommendations.
- **Request Body**: `{ credits, categories, description }`
- **Response**: `200 OK` with recommendation array
- **Format**: `[{ course, reason }]`

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test                    # Run Jest test suite
npm run test:coverage      # Generate coverage report
npm run test:e2e           # Run end-to-end tests
```

### Backend Testing
```bash
cd server/[service-name]
./gradlew test             # Run unit tests
./gradlew integrationTest  # Run integration tests
./gradlew jacocoTestReport # Generate coverage report
```

### Test Structure
- **Unit Tests**: Component/service level isolation testing
- **Integration Tests**: Database and API endpoint testing
- **End-to-End Tests**: Complete user workflow validation
- **Load Tests**: Performance and scalability validation

### Coverage Requirements
- **Minimum 80% code coverage** for all services
- **Critical path testing** for authentication and recommendations
- **API contract testing** using OpenAPI specifications

## 🔧 Configuration

### Environment Variables

#### Application Configuration
```bash
# Database
DB_PASSWORD=your_mysql_password
USERNAME=your_mysql_username

# JWT Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# AI Service
API_URL=https://your-llm-api-endpoint
API_KEY=your_llm_api_key
MODEL=gpt-4

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=admin123
```

#### Service Ports
- **Client**: 3000
- **Course Service**: 8080
- **Authentication Service**: 8081
- **Review Service**: 8082
- **Recommendation Gateway**: 8083
- **GenAI Service**: 8000
- **MySQL**: 3306
- **Prometheus**: 9090
- **Grafana**: 3001

### Deployment Configurations

#### Docker Compose (Local Development)
```bash
docker-compose up -d                    # Start all services
docker-compose -f docker-compose.prod.yml up -d  # Production configuration
```

#### Kubernetes (Production)
```bash
# Deploy with Helm
helm install course-app ./helm-charts/client-app
helm install auth-service ./helm-charts/authentication-service
helm install course-service ./helm-charts/course-service
helm install review-service ./helm-charts/review-service
helm install recommendation-gateway ./helm-charts/recommendation-gateway
helm install genai-service ./helm-charts/genai-service

# Apply additional configurations
kubectl apply -f k8s/unified-ingress.yaml
kubectl apply -f k8s/database-secret.yaml
```

#### AWS (Cloud Deployment)
```bash
# Infrastructure provisioning
cd terraform
terraform init
terraform plan -var-file="prod.tfvars"
terraform apply -var-file="prod.tfvars"

# Application deployment
cd ../ansible
ansible-playbook -i inventory/hosts playbook.yml
```

## 🤝 Contributing

### Development Workflow
1. **Fork the repository** and create a feature branch
2. **Follow coding standards** (ESLint for frontend, CheckStyle for backend)
3. **Write comprehensive tests** for new functionality
4. **Update documentation** for API changes
5. **Submit pull request** with detailed description

### Code Style Guidelines

#### Frontend (TypeScript/React)
- Use **functional components** with hooks
- Implement **TypeScript strict mode** for type safety
- Follow **React best practices** for component design
- Use **TailwindCSS** for consistent styling
- Write **comprehensive unit tests** with Jest and Testing Library

#### Backend (Java/Spring Boot)
- Follow **Spring Boot conventions** and annotations
- Implement **proper exception handling** with custom exceptions
- Use **DTOs** for API layer separation
- Write **integration tests** for database operations
- Document APIs with **OpenAPI/Swagger** annotations

#### AI Service (Python/FastAPI)
- Follow **PEP 8** style guidelines
- Use **type hints** for all function signatures
- Implement **async/await** for I/O operations
- Write **comprehensive docstrings**
- Use **pytest** for testing

### Pull Request Process
1. Ensure all tests pass and coverage requirements are met
2. Update relevant documentation and API specifications
3. Add appropriate labels and assign reviewers
4. Address feedback and maintain clean commit history
5. Merge only after approval from code owners

### Issue Reporting
- Use **issue templates** for bug reports and feature requests
- Include **reproduction steps** and environment details
- Add **appropriate labels** for categorization
- Reference related issues and pull requests

## 📄 License and Credits

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Copyright
Copyright (c) 2025 AET-DevOps25

### Acknowledgments
- **Technical University of Munich (TUM)** for providing the educational context and especially the Department of Computer Science.
- **Spring Boot Community** for the robust microservices framework
- **React Team** for the excellent frontend library
- **LangChain** for the powerful LLM integration capabilities
- **Prometheus & Grafana** communities for monitoring solutions

### Contributors
This project was developed as part of the TUM Advanced Engineering Technologies DevOps course. Special thanks to all team members who contributed to the design, development, and deployment of this comprehensive system.

### Third-Party Libraries
- **Spring Boot**: Apache License 2.0
- **React**: MIT License
- **LangChain**: MIT License
- **TailwindCSS**: MIT License
- **Prometheus**: Apache License 2.0
- **Grafana**: AGPL-3.0 License

---

For more detailed information, please refer to the documentation in the `/docs` directory or visit our [project wiki](https://github.com/aet-devops25/team-git-happens/wiki).
