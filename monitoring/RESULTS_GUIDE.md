# Monitoring Results Guide - Simplified Setup

## Current Monitoring Status

**⚠️ IMPORTANT: Due to limited Kubernetes cluster permissions, the full Prometheus/Grafana stack is NOT deployed. This guide shows what metrics are available at the application level.**

## What You'll See After Running the Pipeline

### ✅ **Application Metrics Endpoints**

After deployment, each Spring Boot service exposes metrics at:

- **Authentication Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/auth/prometheus`
- **Course Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/course/prometheus`
- **Review Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/review/prometheus`
- **Recommendation Gateway**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/gateway/prometheus`

### ❤️ **Health Check Endpoints**

Health status is available at:
- **Authentication Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/auth/health`
- **Course Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/course/health`
- **Review Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/review/health`
- **Recommendation Gateway**: `https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/gateway/health`
- **GenAI Service**: `https://k83-client-app.student.k8s.aet.cit.tum.de/genai/health` (FastAPI service)

### 📈 **Available Metrics**

When you access the `/actuator/prometheus` endpoints, you'll see metrics like:

#### **HTTP Metrics**
```
# HELP http_server_requests_seconds  
# TYPE http_server_requests_seconds summary
http_server_requests_seconds_count{exception="None",method="GET",outcome="SUCCESS",status="200",uri="/actuator/health",} 45.0
http_server_requests_seconds_sum{exception="None",method="GET",outcome="SUCCESS",status="200",uri="/actuator/health",} 0.123456789
```

#### **JVM Metrics**
```
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="PS Eden Space",} 1.234567e+08
jvm_memory_used_bytes{area="heap",id="PS Old Gen",} 2.345678e+07
jvm_memory_used_bytes{area="nonheap",id="Metaspace",} 3.456789e+07
```

#### **Database Metrics**
```
# HELP hikaricp_connections Total connections
# TYPE hikaricp_connections gauge
hikaricp_connections{pool="HikariPool-1",} 10.0
hikaricp_connections_active{pool="HikariPool-1",} 2.0
hikaricp_connections_idle{pool="HikariPool-1",} 8.0
```

#### **Custom Application Metrics**
```
# HELP reviews_created_total Total number of reviews created
# TYPE reviews_created_total counter
reviews_created_total 156.0

# HELP courses_enrolled_total Total course enrollments
# TYPE courses_enrolled_total counter
courses_enrolled_total 89.0
```

## Manual Access Methods

### 🔧 **During Development (Port-Forward)**

To access metrics locally for debugging:

```bash
# Authentication service
kubectl port-forward svc/authentication-service 8080:8080 -n team-git-happens
curl http://localhost:8080/actuator/prometheus

# Course service
kubectl port-forward svc/course-service 8081:8080 -n team-git-happens
curl http://localhost:8081/actuator/prometheus

# Review service
kubectl port-forward svc/review-service 8082:8080 -n team-git-happens
curl http://localhost:8082/actuator/prometheus

# Recommendation gateway
kubectl port-forward svc/recommendation-gateway 8083:8080 -n team-git-happens
curl http://localhost:8083/actuator/prometheus

# GenAI service
kubectl port-forward svc/genai-service 8084:8080 -n team-git-happens
curl http://localhost:8084/actuator/prometheus
```

### 📊 **Pipeline Verification**

The CI/CD pipeline automatically checks that metrics endpoints are working:

```
=== APPLICATION METRICS VERIFICATION ===
Waiting for services to be ready...
✅ Application metrics endpoints are available at:
   📊 Authentication Service: https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/auth/prometheus
   📊 Course Service: https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/course/prometheus
   📊 Review Service: https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/review/prometheus
   📊 Recommendation Gateway: https://k83-client-app.student.k8s.aet.cit.tum.de/monitor/gateway/prometheus
   📊 GenAI Service: https://k83-client-app.student.k8s.aet.cit.tum.de/genai/health

📝 Services with monitoring labels:
   - authentication-service:8080/actuator/prometheus
   - course-service:8080/actuator/prometheus
   - review-service:8080/actuator/prometheus
   - recommendation-gateway:8080/actuator/prometheus
   - genai-service:8080/actuator/prometheus
```

## Consuming Metrics with External Tools

### 1. **External Prometheus Server**

If you have access to an external Prometheus instance, add these scrape configs:

```yaml
scrape_configs:
  - job_name: 'team-git-happens-auth'
    static_configs:
      - targets: ['k83-client-app.student.k8s.aet.cit.tum.de']
    metrics_path: '/monitor/auth/prometheus'
    scrape_interval: 30s
    
  - job_name: 'team-git-happens-course'
    static_configs:
      - targets: ['k83-client-app.student.k8s.aet.cit.tum.de']
    metrics_path: '/monitor/course/prometheus'
    scrape_interval: 30s
    
  - job_name: 'team-git-happens-review'
    static_configs:
      - targets: ['k83-client-app.student.k8s.aet.cit.tum.de']
    metrics_path: '/monitor/review/prometheus'
    scrape_interval: 30s
    
  - job_name: 'team-git-happens-gateway'
    static_configs:
      - targets: ['k83-client-app.student.k8s.aet.cit.tum.de']
    metrics_path: '/monitor/gateway/prometheus'
    scrape_interval: 30s
```

### 2. **DataDog/New Relic Integration**

These platforms can scrape Prometheus endpoints directly or you can configure push-based metrics.

### 3. **Grafana Cloud**

Connect Grafana Cloud to scrape the publicly accessible metrics endpoints.

## Expected Monitoring Data

### 📊 **Performance Metrics**
- Request throughput (requests/second)
- Response times (P50, P95, P99)
- Error rates by service and endpoint
- Database query performance

### 🔧 **Resource Metrics**
- JVM heap/non-heap memory usage
- Garbage collection frequency and duration
- Thread pool utilization
- Database connection pool metrics

### 💼 **Business Metrics**
- User registrations
- Course enrollments
- Reviews created
- API usage patterns

## Troubleshooting

### ❌ **Metrics Not Available**

If you can't access metrics:

1. **Check service health:**
   ```bash
   kubectl get pods -n team-git-happens
   kubectl logs deployment/authentication-service -n team-git-happens
   ```

2. **Verify metrics endpoint:**
   ```bash
   kubectl exec deployment/authentication-service -n team-git-happens -- curl -s http://localhost:8080/actuator/prometheus | head -5
   ```

3. **Check ingress configuration:**
   ```bash
   kubectl get ingress -n team-git-happens
   kubectl describe ingress unified-app-ingress -n team-git-happens
   ```

### ⚠️ **Service Not Ready**

If services show as "not ready" in pipeline output:
- Check resource limits and requests
- Verify database connectivity
- Review application logs for startup errors

## Future Enhancements

When cluster permissions are granted, the existing configuration files support:

### 🚀 **Full Prometheus Stack**
- Automated deployment via Helm
- ServiceMonitor auto-discovery
- Pre-configured Grafana dashboards
- Ingress-based web access

### 📈 **Advanced Monitoring**
- Alerting rules for SLA violations
- Multi-cluster metric federation
- Long-term metric storage
- Custom dashboard creation

The configuration files in this directory (`monitoring-values.yaml`, ServiceMonitor YAMLs, etc.) are ready for immediate deployment once permissions are available.
