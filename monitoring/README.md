# Monitoring Setup for Team Git Happens

This directory contains monitoring configuration files for the Team Git Happens microservices project.

## 🚀 New: Complete Grafana Dashboard Integration

✅ **IMPLEMENTED**: Full monitoring stack with Prometheus and Grafana dashboards

### Features
- **Prometheus**: Metrics collection from all services
- **Grafana**: Pre-configured dashboards with automatic provisioning
- **Spring Boot Integration**: All Java services expose metrics via Actuator + Micrometer
- **GenAI Service Metrics**: Python FastAPI service with Prometheus client
- **Docker Compose Ready**: Complete stack deployment

## Quick Start

### Local Development
```bash
# Validate monitoring setup
./scripts/validate-monitoring.sh

# Start the complete stack with monitoring
docker-compose up -d

# Access points
# Grafana: http://localhost:3001 (admin/admin123)
# Prometheus: http://localhost:9090
```

### CI/CD Pipeline
The monitoring stack is automatically deployed with the application stack. All configuration files are included in the repository.

## Dashboard Overview

### 🎯 Available Dashboards

1. **System Overview** (`system-overview.json`)
   - Service status across all components
   - Overall request rates by service
   - Response time comparison
   - Error rate monitoring

2. **Application Metrics** (`application-metrics.json`)
   - HTTP request rates and response times
   - JVM memory usage (heap/non-heap)
   - Database connection pool metrics
   - Spring Boot actuator metrics

3. **Service Health** (`service-health.json`)
   - Individual service uptime
   - Error rate breakdown (4xx/5xx)
   - Service-specific health indicators

4. **GenAI Metrics** (`genai-metrics.json`)
   - AI service request patterns
   - Chat request rates
   - Response time analysis
   - Custom AI metrics

## Current Monitoring Setup

### 1. Application-Level Metrics
✅ **ACTIVE**: All Spring Boot services expose Prometheus metrics at `/actuator/prometheus`
- authentication-service:8080/actuator/prometheus
- course-service:8080/actuator/prometheus  
- recommendation-gateway:8080/actuator/prometheus
- review-service:8080/actuator/prometheus

### 2. GenAI Service Metrics
✅ **ACTIVE**: Python FastAPI service with Prometheus client
- genai-service:8000/metrics
- Request counting and timing
- Custom business metrics

### 3. Health Check Endpoints
✅ **ACTIVE**: Health status available at `/actuator/health` on all services

### 4. Metrics Available
- HTTP request metrics (rate, duration, status codes)
- JVM metrics (memory, garbage collection, threads)  
- Database connection pool metrics (HikariCP)
- Custom application metrics
- AI service metrics (request patterns, performance)

## Files Structure

```
monitoring/
├── README.md                           # This file
├── RESULTS_GUIDE.md                   # Access instructions
├── IMPLEMENTATION_SUMMARY.md          # Implementation details
├── ENDPOINT_CONSISTENCY_SUMMARY.md    # Endpoint documentation
├── monitoring-values.yaml             # Helm values for Prometheus stack
├── genai-service-monitor.yaml         # GenAI service monitor config
├── grafana-datasources/               # 🆕 Grafana data source configurations
│   └── prometheus.yml                 # Prometheus datasource config
├── grafana-dashboards/                # 🆕 Pre-configured Grafana dashboards
│   ├── dashboards.yml                 # Dashboard provisioning config
│   ├── application-metrics.json       # Spring Boot metrics dashboard
│   ├── service-health.json           # Service health dashboard
│   ├── genai-metrics.json            # GenAI service dashboard
│   └── system-overview.json          # System overview dashboard
└── prometheus/                        # 🆕 Prometheus configuration
    └── prometheus.yml                 # Prometheus scrape configs
```

## 🔧 Configuration Details

### Prometheus Scrape Targets
```yaml
# Spring Boot Services (Actuator + Micrometer)
- course-service:8080/actuator/prometheus
- review-service:8080/actuator/prometheus  
- authentication-service:8080/actuator/prometheus
- recommendation-gateway:8080/actuator/prometheus

# GenAI Service (Python Prometheus Client)
- genai-service:8000/metrics
```

### Grafana Datasource
- **URL**: `http://prometheus:9090`
- **Type**: Prometheus
- **Access**: Server (proxy)
- **Default**: Yes

### Dashboard Features
- **Auto-refresh**: 10 seconds
- **Time range**: Configurable (default: last 15-30 minutes)
- **Responsive design**: Works on desktop and mobile
- **Dark theme**: Professional appearance

## Access Methods

### During CI/CD Pipeline
The pipeline automatically verifies that metrics endpoints are working and provides access instructions.

### Manual Access (Development/Debugging)
```bash
# Port-forward to access metrics locally
kubectl port-forward svc/authentication-service 8080:8080 -n team-git-happens
curl http://localhost:8080/actuator/prometheus

# For other services, use different local ports
kubectl port-forward svc/course-service 8081:8080 -n team-git-happens
kubectl port-forward svc/recommendation-gateway 8082:8080 -n team-git-happens
   ./monitoring/deploy-monitoring.sh
   ```

2. **Access Prometheus:**
   **Via Web (Recommended):**
   ```
   https://k83-client-app.student.k8s.aet.cit.tum.de/prometheus/
   ```
   
   **Via Port-forward:**
   ```bash
   kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
   ```
   Visit: http://localhost:9090

3. **Access Grafana:**
   **Via Web (Recommended):**
   ```
   https://k83-client-app.student.k8s.aet.cit.tum.de/grafana/
   ```
   
   **Via Port-forward:**
   ```bash
   kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
   ```
   Visit: http://localhost:3000
   
   Get admin password:
   ```bash
   kubectl get secret prometheus-grafana -n monitoring -o jsonpath='{.data.admin-password}' | base64 --decode
   ```

## Manual Setup Steps

If you prefer to set up monitoring manually:

### 1. Create monitoring namespace
```bash
kubectl create namespace monitoring
```

### 2. Add Helm repository
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

```

## Integration with External Monitoring

Since the full Prometheus/Grafana stack cannot be deployed due to cluster permissions, the metrics can be consumed by:

### 1. External Prometheus Instance
If you have an external Prometheus server, configure it to scrape the metrics endpoints:

```yaml
# Add to your external prometheus.yml
scrape_configs:
  - job_name: 'team-git-happens-auth'
    static_configs:
      - targets: ['k83-client-app.student.k8s.aet.tum.de:8080']
    metrics_path: '/actuator/prometheus'
    
  - job_name: 'team-git-happens-course'
    static_configs:
      - targets: ['k83-client-app.student.k8s.aet.tum.de:8080']
    metrics_path: '/course/actuator/prometheus'
```

### 2. Push-based Monitoring
For push-based systems like DataDog, New Relic, or Prometheus Pushgateway, the services can be configured to push metrics instead of being scraped.

### 3. Log-based Monitoring
Application logs contain structured data that can be parsed by log aggregation systems like ELK stack or Loki.

## Future Setup (When Permissions Available)

The configuration files in this directory are ready for deployment when cluster permissions allow:

1. **monitoring-values.yaml** - Helm values for Prometheus stack
2. **ServiceMonitor YAMLs** - Kubernetes ServiceMonitor resources
3. **monitoring-ingress.yaml** - Ingress configuration for web access

To deploy when permissions are available:
```bash
# This will work once cluster admin grants required permissions
kubectl create namespace team-git-happens-monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace team-git-happens-monitoring \
  -f ./monitoring/monitoring-values.yaml
```

## Troubleshooting

### Check if metrics are working
```bash
# Test authentication service
kubectl exec deployment/authentication-service -n team-git-happens -- curl -s http://localhost:8080/actuator/prometheus | head -10

# Test course service  
kubectl exec deployment/course-service -n team-git-happens -- curl -s http://localhost:8080/actuator/prometheus | head -10
```

### Check service labels
```bash
kubectl get services -n team-git-happens -l monitoring=true
```

### Check pod status
```bash
kubectl get pods -n team-git-happens
kubectl describe pod <pod-name> -n team-git-happens
```

## Sample Metrics Output

When accessing `/actuator/prometheus`, you should see metrics like:
```
# HELP http_server_requests_seconds
# TYPE http_server_requests_seconds summary
http_server_requests_seconds{exception="None",method="GET",outcome="SUCCESS",status="200",uri="/actuator/health",} 0.001
jvm_memory_used_bytes{area="heap",id="PS Eden Space",} 123456.0
hikaricp_connections{pool="HikariPool-1",} 10.0
```

This provides rich monitoring data for application performance, resource usage, and business metrics.

## Adding Custom Metrics

To add custom business metrics to your Spring Boot services, use Micrometer:

```java
@Component
public class CustomMetrics {
    private final Counter reviewsCreated;
    
    public CustomMetrics(MeterRegistry meterRegistry) {
        this.reviewsCreated = Counter.builder("reviews_created_total")
            .description("Total number of reviews created")
            .register(meterRegistry);
    }
    
    public void incrementReviewsCreated() {
        reviewsCreated.increment();
    }
}
```
