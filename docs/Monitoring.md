````markdown
# Prometheus Setup in Kubernetes (Helm)

This guide covers all the steps required to deploy Prometheus (using the Prometheus Operator) into your Kubernetes cluster via Helm.

## 1. Create the `monitoring` Namespace

```bash
kubectl create namespace monitoring
````

## 2. Add & Update the Prometheus Community Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

## 3. Prepare a `values.yaml`

Create a file called `monitoring-values.yaml` with the following content. Replace `your-storage-class` with the appropriate StorageClass for your cluster.

```yaml
# monitoring-values.yaml
prometheus:
  prometheusSpec:
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: your-storage-class
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 20Gi
    retention: "15d"
    scrapeInterval: "15s"
    serviceMonitorSelectorNilUsesHelmValues: false
    serviceMonitorSelector:
      matchLabels:
        monitoring: "true"

grafana:
  persistence:
    enabled: true
    storageClassName: your-storage-class
    accessModes: ["ReadWriteOnce"]
    size: 10Gi
  dashboards:
    default:
      demo-app:
        json: |-
          {
            "annotations": { "list": [] },
            "panels": [
              {
                "type": "graph",
                "title": "HTTP Requests per Second",
                "targets": [
                  { "expr": "rate(http_requests_total[1m])", "legendFormat": "{{method}} {{handler}}" }
                ]
              },
              {
                "type": "graph",
                "title": "P95 Latency",
                "targets": [
                  { "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, handler))", "legendFormat": "{{handler}}" }
                ]
              },
              {
                "type": "graph",
                "title": "Error Rate (%)",
                "targets": [
                  {
                    "expr": "100 * rate(http_errors_total[5m]) / rate(http_requests_total[5m])",
                    "legendFormat": "error rate"
                  }
                ]
              }
            ],
            "schemaVersion": 16,
            "title": "Demo-App Overview",
            "version": 1
          }

serviceMonitors:
  enabled: true
```

## 4. Install the Helm Chart

```bash
helm install prometheus \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f monitoring-values.yaml
```

This command deploys:

* Prometheus Operator & CRDs
* Prometheus with a PVC for its TSDB
* Alertmanager with a PVC
* Grafana with a PVC and the provided dashboard
* kube-state-metrics, node-exporter, and default ServiceMonitors

## 5. Add Your App’s ServiceMonitor

Create a file named `demo-app-servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: demo-app
  namespace: monitoring
  labels:
    monitoring: "true"
spec:
  selector:
    matchLabels:
      app: demo-app
      monitoring: "true"
  endpoints:
    - port: http
      interval: 15s
      path: /metrics
```

Apply the ServiceMonitor:

```bash
kubectl apply -f demo-app-servicemonitor.yaml
```

Ensure your `demo-app` Deployment/Service has the following labels:

```yaml
metadata:
  labels:
    app: demo-app
    monitoring: "true"
```

## 6. Verify the Setup

1. **Prometheus Targets**:

   ```bash
   kubectl port-forward svc/prometheus-k8s 9090:9090 -n monitoring
   # Visit http://localhost:9090/targets
   ```

2. **Grafana**:

   ```bash
   kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
   # Visit http://localhost:3000 (default credentials: admin/admin)
   ```

You should see your “Demo-App Overview” dashboard displaying request rate, P95 latency, and error rate.

```
```
