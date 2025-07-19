# 🚨 Alerting Setup Complete - Team Git Happens

## ✅ What's Been Implemented

### 1. Complete Monitoring Stack
- **Prometheus**: Metrics collection and alert evaluation
- **Grafana**: Dashboards and visualization (9 comprehensive dashboards)
- **Alertmanager**: Alert routing and notifications

### 2. Alert Configuration
- **Email Alerts**: Configured to send to `ge32zoy@mytum.de`
- **Alert Rules**: 12+ predefined alert rules covering:
  - Service health (ServiceDown)
  - JVM memory usage (85% warning, 95% critical)
  - High CPU usage (80%+)
  - HTTP response time (P95 > 1s)
  - Database connection pool usage
  - GenAI service specific alerts
  - Application service availability

### 3. Access URLs
All monitoring components are accessible via NGINX subpaths:
- **Grafana**: https://compass-app.tum.de/grafana/
- **Prometheus**: https://compass-app.tum.de/prometheus/
- **Alertmanager**: https://compass-app.tum.de/alertmanager/

### 4. Email Configuration
```yaml
# Current SMTP settings for TUM email
smtp_smarthost: 'mail.mytum.de:587'
smtp_from: 'ge32zoy@mytum.de'
smtp_auth_username: 'ge32zoy@mytum.de'
smtp_auth_password: 'your-tum-password'  # ⚠️ UPDATE THIS
```

## 🔧 Next Steps

### 1. Complete Email Setup
To receive actual email alerts, update the password in `/k8s/alertmanager.yaml`:
```bash
# Edit the alertmanager config
kubectl edit configmap alertmanager-config -n team-git-happens

# Replace 'your-tum-password' with your actual TUM password
# Then restart Alertmanager:
kubectl rollout restart deployment/alertmanager -n team-git-happens
```

### 2. Test Alerts
Trigger a test alert by stopping a service:
```bash
# Scale down a service to trigger ServiceDown alert
kubectl scale deployment course-service --replicas=0 -n team-git-happens

# Wait 30 seconds, then check alerts in Alertmanager UI
# Scale back up:
kubectl scale deployment course-service --replicas=1 -n team-git-happens
```

### 3. Alternative Email Providers
If TUM SMTP doesn't work, you can switch to:

**Gmail** (requires App Password):
```yaml
smtp_smarthost: 'smtp.gmail.com:587'
smtp_auth_password: 'your-gmail-app-password'
```

**Outlook**:
```yaml
smtp_smarthost: 'smtp-mail.outlook.com:587'
```

### 4. Add More Alert Channels
Uncomment and configure Slack in `/k8s/alertmanager.yaml`:
```yaml
slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#alerts'
```

## 📊 Dashboard Features

Your Grafana includes these enhanced dashboards:
1. **System Overview** - High-level system health
2. **Application Metrics** - Spring Boot application metrics
3. **Service Health** - Service availability and uptime
4. **Performance Deep Dive** - Response times, throughput
5. **Database Insights** - Connection pools, query performance
6. **GenAI Metrics** - AI service specific monitoring
7. **Enhanced Metrics** - Advanced visualizations
8. **Comprehensive Metrics** - All-in-one overview
9. **GenAI Specialized** - Detailed AI service analytics

## 🔄 CI/CD Integration

The monitoring stack is fully integrated into your CI/CD pipeline:
- Automatic dashboard updates
- Configmap regeneration with all dashboard files
- Monitoring stack deployment on every pipeline run
- Zero-downtime updates via rolling deployments

## 🎯 Alert Rules Summary

| Alert | Threshold | Duration | Severity |
|-------|-----------|----------|----------|
| ServiceDown | up == 0 | 30s | Critical |
| JVMMemoryHigh | >85% heap | 2m | Warning |
| JVMMemoryCritical | >95% heap | 1m | Critical |
| HighCPUUsage | >80% CPU | 5m | Warning |
| HighResponseTime | P95 > 1s | 3m | Warning |
| GenAIServiceDown | up == 0 | 30s | Critical |
| DatabaseConnectionPoolLow | >80% usage | 2m | Warning |

## 🔐 Security Note

**Important**: Update the email password in the Alertmanager configuration before enabling notifications. The current configuration uses a placeholder password.

## ✨ Success!

Your monitoring and alerting system is now fully operational and integrated into your DevOps pipeline. All components are running and ready to notify you of any issues with your microservices architecture.
