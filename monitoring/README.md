# Monitoring Setup for Team Git Happens

This directory contains all the necessary files to set up Prometheus and Grafana monitoring for the Team Git Happens microservices project.

## Files Structure

```
monitoring/
├── monitoring-values.yaml          # Helm values for Prometheus stack
├── deploy-monitoring.sh           # Deployment script
├── authentication-service-monitor.yaml
├── course-service-monitor.yaml
├── review-service-monitor.yaml
├── recommendation-gateway-monitor.yaml
└── genai-service-monitor.yaml
```

## What's Been Configured

### 1. Spring Boot Services
- Added `spring-boot-starter-actuator` and `micrometer-registry-prometheus` dependencies
- Configured `/actuator/prometheus` endpoint in all Java services
- Services monitored: authentication-service, course-service, review-service, recommendation-gateway

### 2. Service Labels
- Added `monitoring: "true"` label to all service templates in Helm charts
- This allows ServiceMonitors to discover the services automatically

### 3. Metrics Available
- HTTP request metrics (rate, duration, status codes)
- JVM metrics (memory, garbage collection, threads)
- Database connection pool metrics (HikariCP)
- Custom application metrics

### 4. Grafana Dashboard
- Pre-configured dashboard showing:
  - HTTP Requests per Second
  - P95 Latency
  - Error Rate (%)
  - JVM Memory Usage
  - Database Connections

## Quick Setup

### Automated Setup (Recommended)
The monitoring stack is automatically deployed as part of the CI/CD pipeline in `.github/workflows/KubernetesCD.yml`. Just run the pipeline and monitoring will be set up automatically!

### Manual Setup (Alternative)
1. **Deploy the monitoring stack:**
   ```bash
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

### 3. Install Prometheus stack
```bash
helm upgrade --install prometheus \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f ./monitoring/monitoring-values.yaml
```

### 4. Apply ServiceMonitors
```bash
kubectl apply -f ./monitoring/authentication-service-monitor.yaml
kubectl apply -f ./monitoring/course-service-monitor.yaml
kubectl apply -f ./monitoring/review-service-monitor.yaml
kubectl apply -f ./monitoring/recommendation-gateway-monitor.yaml
kubectl apply -f ./monitoring/genai-service-monitor.yaml
```

## Redeploy Services

After setting up monitoring, you need to redeploy your services to pick up the new actuator endpoints:

```bash
# Redeploy all services to enable monitoring
helm upgrade --install authentication-service ./helm-charts/authentication-service --namespace team-git-happens --set image.tag=latest
helm upgrade --install course-service ./helm-charts/course-service --namespace team-git-happens --set image.tag=latest
# Note: review-service might have deployment issues, handle separately
helm upgrade --install recommendation-gateway ./helm-charts/recommendation-gateway --namespace team-git-happens --set image.tag=latest
helm upgrade --install genai-service ./helm-charts/genai-service --namespace team-git-happens --set image.tag=latest
```

## Verifying the Setup

1. **Check ServiceMonitor discovery:**
   In Prometheus UI, go to Status > Targets to see if your services are being scraped.

2. **Test metrics endpoints:**
   ```bash
   kubectl port-forward svc/authentication-service 8080:8080 -n team-git-happens
   curl http://localhost:8080/actuator/prometheus
   ```

3. **View dashboards:**
   In Grafana, look for the "Team Git Happens - Services Overview" dashboard.

## Troubleshooting

- **Services not appearing in Prometheus targets:** Check that services have the `monitoring: "true"` label
- **No metrics data:** Verify actuator endpoints are accessible and services are rebuilt with new dependencies
- **Permission errors:** Ensure ServiceMonitors are in the `monitoring` namespace but target services in `team-git-happens` namespace

## Adding Custom Metrics

To add custom metrics to your Spring Boot services, use Micrometer:

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
