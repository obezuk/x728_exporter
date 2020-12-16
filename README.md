# X728 UPS Prometheus exporter

Prometheus exporter for [Raspberry Pi X728 UPS](https://geekworm.com/products/raspberry-pi-x728-max-5-1v-8a-18650-ups-power-management-board) metrics, written in Node.js and runs in Docker. Useful for monitoring battery status with Prometheus and Grafana.

Metrics are available from http://localhost:9728/metrics

![Example Grafana Dashboard](https://github.com/obezuk/x728_exporter/blob/master/dashboard.png?raw=true)

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
