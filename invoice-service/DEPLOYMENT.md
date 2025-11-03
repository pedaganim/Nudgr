# Deployment Guide

## Overview
This document describes how to deploy the Invoice Service application using the CI/CD pipeline and various deployment strategies.

## Table of Contents
- [Prerequisites](#prerequisites)
- [CI/CD Pipeline](#cicd-pipeline)
- [Local Docker Deployment](#local-docker-deployment)
- [Deployment Strategies](#deployment-strategies)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Health Checks](#monitoring-and-health-checks)

---

## Prerequisites

### Required Software
- Java 21 (Temurin/OpenJDK)
- Gradle 8.x (or use wrapper)
- Docker (for containerized deployment)
- Git

### Required Secrets (for CI/CD)
Configure these in GitHub Settings → Secrets and variables → Actions:

| Secret Name | Description | Required For |
|------------|-------------|--------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | AWS deployments |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | AWS deployments |
| `HEROKU_API_KEY` | Heroku API key | Heroku deployments |
| `HEROKU_EMAIL` | Heroku account email | Heroku deployments |
| `PROD_HOST` | Production server hostname | SSH deployments |
| `PROD_USERNAME` | SSH username | SSH deployments |
| `PROD_SSH_KEY` | SSH private key | SSH deployments |
| `DOCKER_USERNAME` | Docker Hub username | Docker registry |
| `DOCKER_PASSWORD` | Docker Hub password | Docker registry |

---

## CI/CD Pipeline

### Workflow Overview
The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Pipeline Stages

#### 1. Test
- Runs all unit and integration tests
- Generates test reports
- Uploads test results as artifacts
- **Required to pass** before build stage

#### 2. Build
- Compiles the application
- Creates executable JAR
- Uploads build artifact
- Skips tests (already run in test stage)

#### 3. Code Quality
- Runs code formatting checks (Spotless)
- Can be extended with additional quality gates

#### 4. Deploy to Staging
- **Triggers:** Push to `develop` branch
- Downloads build artifact
- Deploys to staging environment
- Environment URL: Configure in workflow

#### 5. Deploy to Production
- **Triggers:** Push to `main` branch
- Downloads build artifact
- Deploys to production environment
- **Requires manual approval** (configure in GitHub settings)

### Setting Up Environments

1. Go to GitHub repository → Settings → Environments
2. Create `staging` and `production` environments
3. For production, enable "Required reviewers" for manual approval
4. Add environment-specific secrets and variables

---

## Local Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (clean state)
docker-compose down -v
```

### Access the Application
- **API:** http://localhost:8080
- **Database:** localhost:5432
- **Health Check:** http://localhost:8080/actuator/health

### Build Docker Image Only

```bash
# Build the image
docker build -t invoice-service:latest .

# Run the container
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/invoice_db \
  -e SPRING_DATASOURCE_USERNAME=appuser \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  invoice-service:latest
```

---

## Deployment Strategies

### 1. Heroku Deployment

#### Setup
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create invoice-service-prod

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini
```

#### Manual Deployment
```bash
# Deploy from local
heroku container:push web --app invoice-service-prod
heroku container:release web --app invoice-service-prod

# View logs
heroku logs --tail --app invoice-service-prod
```

#### GitHub Actions Deployment
Uncomment the Heroku deployment section in `.github/workflows/ci-cd.yml` and configure secrets.

---

### 2. AWS Deployment

#### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker invoice-service

# Create environment
eb create invoice-service-prod

# Deploy
eb deploy

# View logs
eb logs
```

#### AWS ECS (Fargate)

1. **Build and push Docker image:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t invoice-service .
docker tag invoice-service:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-service:latest
```

2. **Create ECS task definition and service** (via AWS Console or CLI)

---

### 3. Traditional Server Deployment (SSH)

#### Prerequisites on Server
```bash
# Install Java 21
sudo apt update
sudo apt install openjdk-21-jre

# Create application user
sudo useradd -m -s /bin/bash invoiceapp

# Create directories
sudo mkdir -p /opt/invoice-service
sudo chown invoiceapp:invoiceapp /opt/invoice-service
```

#### Deployment Script (`deploy.sh` on server)
```bash
#!/bin/bash
set -e

APP_DIR="/opt/invoice-service"
JAR_NAME="invoice-service.jar"

# Stop running application
sudo systemctl stop invoice-service || true

# Backup old version
if [ -f "$APP_DIR/$JAR_NAME" ]; then
  mv "$APP_DIR/$JAR_NAME" "$APP_DIR/${JAR_NAME}.bak"
fi

# Copy new version (artifact uploaded via SCP/rsync)
cp /tmp/$JAR_NAME $APP_DIR/

# Set permissions
chown invoiceapp:invoiceapp $APP_DIR/$JAR_NAME

# Start application
sudo systemctl start invoice-service
sudo systemctl status invoice-service
```

#### Systemd Service (`/etc/systemd/system/invoice-service.service`)
```ini
[Unit]
Description=Invoice Service
After=network.target

[Service]
Type=simple
User=invoiceapp
ExecStart=/usr/bin/java -jar /opt/invoice-service/invoice-service.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/invoice_db"
Environment="SPRING_DATASOURCE_USERNAME=appuser"
Environment="SPRING_DATASOURCE_PASSWORD=secret"

[Install]
WantedBy=multi-user.target
```

---

### 4. Kubernetes Deployment

#### Create Kubernetes manifests

**deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: invoice-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: invoice-service
  template:
    metadata:
      labels:
        app: invoice-service
    spec:
      containers:
      - name: invoice-service
        image: your-registry/invoice-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

**service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: invoice-service
spec:
  type: LoadBalancer
  selector:
    app: invoice-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

Deploy:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

---

## Environment Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `local` | No |
| `SPRING_DATASOURCE_URL` | Database JDBC URL | H2 in-memory | Yes (prod) |
| `SPRING_DATASOURCE_USERNAME` | Database username | - | Yes (prod) |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - | Yes (prod) |
| `APP_UPLOADS_DIR` | Directory for file uploads | `./uploads` | No |
| `SERVER_PORT` | Application port | `8080` | No |

### Application Profiles

- **local** (default): H2 database, dev tools, console enabled
- **prod**: PostgreSQL, optimized for production
- **test**: H2 in-memory, test data seeding

### Database Setup

#### Production PostgreSQL
```sql
CREATE DATABASE invoice_db;
CREATE USER appuser WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO appuser;
```

---

## Monitoring and Health Checks

### Actuator Endpoints

The application exposes Spring Boot Actuator endpoints:

- **Health:** `GET /actuator/health`
- **Info:** `GET /actuator/info`
- **Metrics:** `GET /actuator/metrics` (if enabled)

### Health Check Response
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### Logging

- **Console:** All environments
- **File:** Configured per environment
- **Log Level:** INFO (prod), DEBUG (local)

### Monitoring Tools (Recommended)

- **Application Performance:** New Relic, Datadog, AppDynamics
- **Logging:** ELK Stack, Splunk, CloudWatch Logs
- **Metrics:** Prometheus + Grafana
- **Uptime:** Pingdom, UptimeRobot, StatusCake

---

## Rollback Procedure

### Heroku
```bash
heroku rollback --app invoice-service-prod
```

### AWS Elastic Beanstalk
```bash
eb deploy --version <previous-version>
```

### Kubernetes
```bash
kubectl rollout undo deployment/invoice-service
```

### Traditional Server
```bash
# SSH into server
cd /opt/invoice-service
sudo systemctl stop invoice-service
mv invoice-service.jar invoice-service.jar.failed
mv invoice-service.jar.bak invoice-service.jar
sudo systemctl start invoice-service
```

---

## Troubleshooting

### Common Issues

#### Application won't start
- Check logs: `docker-compose logs app` or `journalctl -u invoice-service`
- Verify database connectivity
- Check environment variables
- Ensure Java 21 is installed

#### Database connection failed
- Verify database is running
- Check connection string format
- Verify credentials
- Check network/firewall rules

#### Out of memory
- Increase JVM heap size: `-Xmx1g`
- Check for memory leaks
- Monitor with actuator metrics

### Support
For issues, check:
1. Application logs
2. GitHub Actions workflow runs
3. Health check endpoint
4. Database logs

---

## Security Checklist

- [ ] Use strong database passwords
- [ ] Store secrets in environment variables (never in code)
- [ ] Enable HTTPS in production
- [ ] Configure CORS appropriately
- [ ] Limit file upload sizes
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Monitor for vulnerabilities
- [ ] Implement rate limiting
- [ ] Set up proper backup procedures

---

## Next Steps

1. Configure deployment target in GitHub workflow
2. Set up environment secrets in GitHub
3. Test deployment in staging environment
4. Set up monitoring and alerting
5. Configure automated backups
6. Document runbook for operations team
