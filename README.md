# X728 UPS Prometheus exporter

Prometheus exporter for Raspberry Pi X728 UPS metrics, written in Node.js and runs in Docker. Useful for monitoring battery status with Prometheus and Grafana.

Metrics are available from http://localhost:9728/metrics

## Metrics
- Battery Capacity (Decimal ranging from 0 and 1)
- Voltage
- AC Status (0 or 1)

## Running in Docker

You'll need to ensure your container can read `/dev/i2c-1` to read voltage / capacity metrics and `/sys/class/gpio` to check AC status.

Here's my docker-compose config:

```
version: '3'
services:
  x728exporter:
    container_name: ups
    hostname: x728exporter
    build: .
    user: root
    privileged: true
    restart: unless-stopped
    ports:
    - 9728:9728
    devices:
    - "/dev/i2c-1:/dev/i2c-1"
    volumes:
    - "/sys/class/gpio:/sys/class/gpio"
```