# Monitoring Results Guide

## What You'll See After Running the Pipeline

### 📊 **Grafana Dashboards**

Once you access Grafana at `https://k83-client-app.student.k8s.aet.cit.tum.de/grafana/`, you'll find:

#### **Pre-configured Dashboard: "Team Git Happens - Services Overview"**
- **HTTP Requests per Second**: Real-time request rates for all services
- **P95 Latency**: 95th percentile response times
- **Error Rate (%)**: Percentage of failed requests
- **JVM Memory Usage**: Heap and non-heap memory consumption
- **Database Connections**: HikariCP connection pool metrics

### 🎯 **Prometheus Targets**

In Prometheus (`https://k83-client-app.student.k8s.aet.cit.tum.de/prometheus/`), go to **Status → Targets** to see:

- ✅ `authentication-service/0` (up)
- ✅ `course-service/0` (up)  
- ✅ `review-service/0` (up)
- ✅ `recommendation-gateway/0` (up)
- ✅ `genai-service/0` (up)

### 📈 **Available Metrics**

You can query these metrics in Prometheus:

#### **HTTP Metrics**
```promql
# Request rate
rate(http_requests_total[5m])

# Request duration
http_request_duration_seconds

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

#### **JVM Metrics**
```promql
# Memory usage
jvm_memory_used_bytes

# Garbage collection
jvm_gc_pause_seconds_count

# Thread count
jvm_threads_live_threads
```

#### **Database Metrics**
```promql
# Active connections
hikaricp_connections_active

# Connection timeout
hikaricp_connections_timeout_total
```

### 🔍 **Service Health Checks**

Check individual service metrics:

```bash
# Authentication Service
kubectl port-forward svc/authentication-service 8080:8080 -n team-git-happens
curl http://localhost:8080/actuator/prometheus

# Course Service  
kubectl port-forward svc/course-service 8081:8080 -n team-git-happens
curl http://localhost:8081/actuator/prometheus

# Or access via your application URL (if actuator endpoints are exposed):
# https://k83-client-app.student.k8s.aet.cit.tum.de/api/auth/actuator/prometheus
# https://k83-client-app.student.k8s.aet.cit.tum.de/api/courses/actuator/prometheus
```

### 📱 **What Metrics Look Like**

#### **Sample HTTP Metrics Output:**
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200",uri="/courses"} 125.0
http_requests_total{method="POST",status="201",uri="/courses"} 15.0
http_requests_total{method="GET",status="404",uri="/courses/999"} 3.0

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",uri="/courses",le="0.1"} 98.0
http_request_duration_seconds_bucket{method="GET",uri="/courses",le="0.5"} 120.0
```

#### **Sample JVM Metrics:**
```
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="G1 Eden Space"} 1.2345678e+07
jvm_memory_used_bytes{area="heap",id="G1 Old Gen"} 5.4321098e+07
```

### 🚨 **Troubleshooting**

If you don't see metrics:

1. **Check service labels:**
   ```bash
   kubectl get services -n team-git-happens -l monitoring=true
   ```

2. **Check actuator endpoints:**
   ```bash
   kubectl exec -it deployment/authentication-service -n team-git-happens -- curl localhost:8080/actuator/health
   ```

3. **Check ServiceMonitor status:**
   ```bash
   kubectl describe servicemonitor authentication-service -n monitoring
   ```

### 🎯 **Expected Timeline**

- **Immediate**: Pipeline completes, monitoring pods start
- **2-3 minutes**: Prometheus starts scraping metrics
- **5 minutes**: First metrics appear in Grafana
- **10+ minutes**: Full historical data for trend analysis

### 📊 **Sample Queries to Try**

Once in Prometheus, try these queries:

```promql
# Top 5 most called endpoints
topk(5, sum by (uri) (rate(http_requests_total[5m])))

# Average response time by service
avg by (job) (rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]))

# Services with high error rates
rate(http_requests_total{status=~"5.."}[5m]) > 0.01
```
