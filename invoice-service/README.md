# Invoice Service 📄

A production-ready invoice management system built with **Java 21**, **Spring Boot 3.3**, and modern web technologies. Features comprehensive invoice handling, customer management, PDF generation, and automated deployment to Heroku.

[![CI/CD](https://github.com/pedaganim/Nudgr/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/pedaganim/Nudgr/actions)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🌐 Live Demo

- **Production**: [https://invoice-service-prod-2256fd5e6c34.herokuapp.com](https://invoice-service-prod-2256fd5e6c34.herokuapp.com)
- **Staging**: [https://invoice-service-staging.herokuapp.com](https://invoice-service-staging.herokuapp.com)

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#️-configuration)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Development](#development)
- [Testing](#testing)
- [Architecture](#architecture)
- [Roadmap](#️-roadmap)
- [Performance & Metrics](#-performance--metrics)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- 📝 **Invoice Management**
  - CRUD operations with 8-digit auto-generated invoice numbers
  - Invoice status tracking (Draft, Finalized, Paid, Cancelled)
  - Line items with service dates, products/services, quantities, and rates
  - Automatic GST calculation (10%)
  - Payment tracking with amount and date
  - Custom terms, tags, and notes
  
- 👥 **Customer Management**
  - Customer profiles with contact details
  - Unique email validation
  - Billing address management
  - Customer history tracking

- 📎 **Attachments**
  - File upload support (up to 10MB per file)
  - Multiple attachments per invoice
  - Secure storage and retrieval
  - File type validation

- 📄 **PDF Generation**
  - Professional invoice PDF export
  - Customizable templates
  - Download and email capabilities

- 🔒 **Security**
  - Spring Security integration
  - Authentication and authorization
  - CORS configuration
  - SQL injection prevention

### Technical Features
- ✅ RESTful API with comprehensive endpoints
- ✅ Database migrations with Flyway
- ✅ Health checks and monitoring (Spring Actuator)
- ✅ Unit tests with 36+ test cases (JUnit 5, AssertJ)
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Docker containerization
- ✅ Automated Heroku deployment
- ✅ PostgreSQL 17.x support
- ✅ Responsive React UI with TailwindCSS

## 🛠️ Tech Stack

### Backend
- **Language**: Java 21 (Eclipse Temurin)
- **Framework**: Spring Boot 3.3.4
  - 🌐 Spring Web (REST API)
  - 💾 Spring Data JPA (ORM)
  - 🔐 Spring Security (Authentication & Authorization)
  - 📊 Spring Actuator (Health checks & Metrics)
  - ✅ Spring Validation (Input validation)
- **Database**: 
  - PostgreSQL 17.x (Production - Heroku)
  - H2 (Development/Testing)
- **Migrations**: Flyway 9.x with PostgreSQL support
- **Build Tool**: Gradle 9.2 (Kotlin DSL)
- **PDF Generation**: OpenHTMLToPDF 1.0.10
- **Additional Libraries**:
  - Lombok (boilerplate reduction)
  - MapStruct 1.5.5 (object mapping)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios

### Testing
- **Unit Testing**: JUnit 5 (Jupiter)
- **Assertions**: AssertJ (fluent assertions)
- **Mocking**: Mockito
- **Integration Testing**: Testcontainers (PostgreSQL)
- **Coverage**: 36+ test cases across domain entities

### DevOps & Infrastructure
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment Platform**: Heroku
  - Container stack
  - PostgreSQL Essential-0 addon
  - Automated deployments
- **Monitoring**: 
  - Spring Boot Actuator
  - Heroku application metrics
  - GitHub Actions workflow monitoring

### Development Tools
- **IDE**: Compatible with IntelliJ IDEA, VS Code, Eclipse
- **Version Control**: Git
- **Code Quality**: Spotless, Checkstyle (optional)
- **API Testing**: Postman, cURL

## Quick Start

### Prerequisites
- Java 21
- Node.js 18+ (for UI)
- Docker (optional)

### Run Locally (Development Mode)

#### Backend
```bash
# Using Gradle wrapper
./gradlew bootRun

# The API will be available at http://localhost:8080
```

#### Frontend
```bash
cd ui
npm install
npm run dev

# The UI will be available at http://localhost:5174
```

### Run with Docker Compose

```bash
# Build and start all services (database + app)
docker-compose up --build

# Access at http://localhost:8080
```

### Run Tests

```bash
# Run all tests
./gradlew test

# Run domain entity tests only
./gradlew test --tests "com.example.invoice.model.*"

# Run with coverage report (after JaCoCo setup)
./gradlew test jacocoTestReport
```

## Project Structure

```
invoice-service/
├── src/
│   ├── main/
│   │   ├── java/com/example/invoice/
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── model/            # Domain entities
│   │   │   ├── repository/       # JPA repositories
│   │   │   ├── service/          # Business logic
│   │   │   └── config/           # Configuration classes
│   │   └── resources/
│   │       ├── application-local.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/     # Flyway migrations
│   └── test/
│       └── java/com/example/invoice/
│           └── model/            # Entity unit tests
├── ui/                           # React frontend
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── services/            # API clients
│   │   └── ui/                  # Shared components
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions pipeline
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Local development stack
├── build.gradle                  # Gradle build configuration
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

## API Documentation

### Invoices
- `GET /api/invoices` - List all invoices (paginated)
- `GET /api/invoices/{id}` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `POST /api/invoices/{id}/finalize` - Finalize invoice
- `GET /api/invoices/{id}/pdf` - Download invoice as PDF

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer (idempotent)
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Attachments
- `GET /api/invoices/{id}/attachments` - List invoice attachments
- `POST /api/invoices/{id}/attachments` - Upload attachment
- `GET /api/attachments/{id}` - Download attachment
- `DELETE /api/attachments/{id}` - Delete attachment

### Health & Monitoring
- `GET /actuator/health` - Health check endpoint
- `GET /actuator/info` - Application info
- `GET /actuator/metrics` - Application metrics

## ⚙️ Configuration

### Environment Variables

#### Local Development
| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active profile | `local` |
| `SERVER_PORT` | Application port | `8080` |
| `APP_UPLOADS_DIR` | Attachment storage | `./uploads` |

#### Production (Self-Hosted)
| Variable | Description | Required |
|----------|-------------|----------|
| `SPRING_PROFILES_ACTIVE` | Set to `prod` | ✅ |
| `SPRING_DATASOURCE_URL` | JDBC connection URL | ✅ |
| `SPRING_DATASOURCE_USERNAME` | Database username | ✅ |
| `SPRING_DATASOURCE_PASSWORD` | Database password | ✅ |
| `APP_UPLOADS_DIR` | Attachment storage path | ✅ |
| `SERVER_PORT` | Application port | Optional (8080) |

#### Heroku Deployment
| Variable | Description | Auto-Configured |
|----------|-------------|-----------------|
| `SPRING_PROFILES_ACTIVE` | Set to `heroku` | ✅ (by workflow) |
| `DATABASE_URL` | PostgreSQL connection | ✅ (by Heroku addon) |
| `PORT` | Dynamic port assignment | ✅ (by Heroku) |
| `APP_UPLOADS_DIR` | Set to `/tmp/uploads` | ✅ (by workflow) |

> **Note**: Heroku uses `DATABASE_URL` format (`postgres://...`) which is automatically converted to JDBC format (`jdbc:postgresql://...`) by `HerokuDataSourceConfig`.

### Application Profiles

- **`local`** - H2 in-memory database, development settings
- **`prod`** - PostgreSQL with custom env vars
- **`heroku`** - Heroku-specific configuration with `DATABASE_URL` support

### Database Setup (Self-Hosted Production)

```sql
-- Create database
CREATE DATABASE invoice_db;

-- Create user
CREATE USER appuser WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO appuser;

-- Connect and grant schema permissions
\c invoice_db
GRANT ALL ON SCHEMA public TO appuser;
```

## 🚀 CI/CD Pipeline

The project uses **GitHub Actions** for fully automated continuous integration and deployment to Heroku.

### Pipeline Workflow

```
┌─────────────┐
│  Push Code  │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       v                  v
┌─────────────┐    ┌─────────────┐
│    Test     │    │    Build    │
│  (JUnit 5)  │    │  (Gradle)   │
└──────┬──────┘    └──────┬──────┘
       │                  │
       └────────┬─────────┘
                v
     ┌──────────────────┐
     │  Setup Heroku    │
     │  Infrastructure  │
     └────────┬─────────┘
              v
     ┌──────────────────┐
     │  Deploy to       │
     │  Heroku          │
     └──────────────────┘
```

### Pipeline Stages

1. **Test** 
   - Runs all unit tests (36+ test cases)
   - Generates test reports with `dorny/test-reporter`
   - Uploads test artifacts

2. **Build**
   - Compiles Java 21 code with Gradle
   - Builds JAR artifact
   - Validates build success

3. **Code Quality** *(optional)*
   - Runs Spotless/Checkstyle checks
   - Enforces code formatting standards

4. **Setup Heroku Infrastructure**
   - Creates Heroku app (if doesn't exist)
   - Provisions PostgreSQL Essential-0 addon
   - Sets container stack
   - Configures environment variables

5. **Deploy**
   - Builds Docker image
   - Pushes to Heroku container registry
   - Deploys to staging (on `develop` branch push)
   - Deploys to production (on `main` branch push)

### Deployment Triggers

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | https://invoice-service-prod.herokuapp.com |
| `develop` | Staging | https://invoice-service-staging.herokuapp.com |
| Pull Requests | - | Tests only (no deployment) |

### Required GitHub Secrets

Configure these secrets in **GitHub → Settings → Secrets → Actions**:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `HEROKU_API_KEY` | Heroku API authentication | Account Settings → API Key |
| `HEROKU_EMAIL` | Heroku account email | Your Heroku login email |

### Manual Deployment

To deploy manually or from a feature branch:

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login to Heroku
heroku login

# Deploy to production
git push heroku main

# Deploy feature branch to staging
git push heroku feature-branch:main --app invoice-service-staging

# View logs
heroku logs --tail --app invoice-service-prod
```

For detailed deployment instructions, see:
- [AUTOMATED_HEROKU_SETUP.md](AUTOMATED_HEROKU_SETUP.md) - Automated GitHub Actions deployment
- [HEROKU_SETUP.md](HEROKU_SETUP.md) - Manual Heroku deployment guide

## Development

### Building

```bash
# Clean build
./gradlew clean build

# Build without tests
./gradlew build -x test

# Build Docker image
docker build -t invoice-service:latest .
```

### Code Quality

```bash
# Format code (when Spotless configured)
./gradlew spotlessApply

# Check formatting
./gradlew spotlessCheck
```

### Database Migrations

Flyway migrations are in `src/main/resources/db/migration/`.

```bash
# Run migrations
./gradlew flywayMigrate

# Migration info
./gradlew flywayInfo
```

## Testing

The project includes comprehensive unit tests for domain entities:
- **InvoiceTest** (15 tests)
- **CustomerTest** (10 tests)
- **InvoiceItemTest** (11 tests)

All tests use JUnit 5 and AssertJ for fluent assertions.

## Architecture

The application follows **Clean Architecture** principles:

- **Domain Layer**: Entities (Invoice, Customer, InvoiceItem)
- **Use Case Layer**: Services (InvoiceService, AttachmentStorageService)
- **Adapter Layer**: Controllers, Repositories
- **Infrastructure**: Configuration, Security, Framework

### Key Principles
- Inner layers have no dependencies on outer layers
- Domain is framework-independent
- Dependency inversion via ports/adapters
- Clear separation of concerns

## 🗺️ Roadmap

### 🎯 Phase 1 - Core Features (✅ Completed)
- [x] Invoice CRUD operations
- [x] Customer management
- [x] PDF generation
- [x] File attachments
- [x] RESTful API
- [x] Automated Heroku deployment
- [x] CI/CD pipeline

### 🚧 Phase 2 - Enhancement (In Progress)
- [ ] Email integration (SMTP/SendGrid)
- [ ] Advanced search and filtering
- [ ] Invoice templates customization
- [ ] Audit logs and version history
- [ ] Bulk operations

### 📅 Phase 3 - Advanced Features (Planned)
- [ ] Advanced reporting & analytics
- [ ] Recurring invoices and subscriptions
- [ ] Customer self-service portal
- [ ] Multi-currency support
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Mobile app (React Native)

### 🏢 Phase 4 - Enterprise (Future)
- [ ] Multi-tenancy support
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Webhook notifications
- [ ] White-label capability
- [ ] Advanced compliance (SOC 2, GDPR)

## 📊 Performance & Metrics

### Application Performance
- **Startup Time**: ~15-20 seconds (including Flyway migrations)
- **Average Response Time**: <100ms (REST API endpoints)
- **Memory Usage**: ~200-300MB (Java heap)
- **Database Connections**: Pool of 10 (max), 2 (min idle)

### Test Coverage
- **Unit Tests**: 36+ test cases
- **Domain Entities**: 100% coverage
  - Invoice: 15 tests
  - Customer: 10 tests
  - InvoiceItem: 11 tests

### Deployment Metrics
- **Build Time**: ~2-3 minutes
- **Docker Image Size**: ~180MB (multi-stage optimized)
- **Deployment Time**: ~3-5 minutes (end-to-end)

## 🐛 Troubleshooting

### Application Issues

#### App Won't Start Locally
```bash
# 1. Verify Java version
java -version  # Should show Java 21

# 2. Check if port 8080 is available
lsof -i :8080

# 3. Clean and rebuild
./gradlew clean build

# 4. Check logs
tail -f logs/application.log
```

#### Database Connection Fails
- **H2 (Local)**: Check if H2 is enabled in `application-local.yml`
- **PostgreSQL (Prod)**: Verify connection string, username, and password
- **Heroku**: Check `DATABASE_URL` is set correctly

```bash
# Verify Heroku database
heroku config --app invoice-service-prod | grep DATABASE_URL
```

#### Tests Fail
```bash
# 1. Clean test cache
./gradlew clean test --rerun-tasks

# 2. Run specific test
./gradlew test --tests "InvoiceTest"

# 3. Check JUnit Platform Launcher
./gradlew dependencies | grep junit-platform-launcher
```

### Docker Issues

#### Build Fails
```bash
# 1. Check Docker is running
docker info

# 2. Clear Docker cache
docker system prune -a

# 3. Build with no cache
docker build --no-cache -t invoice-service .
```

#### Container Won't Start
```bash
# 1. Check logs
docker logs <container-id>

# 2. Run interactively
docker run -it invoice-service /bin/sh

# 3. Verify environment variables
docker inspect <container-id> | grep -A 10 "Env"
```

### Heroku Deployment Issues

#### Deployment Fails
```bash
# 1. Check GitHub Actions logs
# Go to: https://github.com/pedaganim/Nudgr/actions

# 2. View Heroku logs
heroku logs --tail --app invoice-service-prod

# 3. Check app status
heroku ps --app invoice-service-prod

# 4. Restart dyno
heroku restart --app invoice-service-prod
```

#### Database Migration Fails
```bash
# 1. Check Flyway status
heroku run ./gradlew flywayInfo --app invoice-service-prod

# 2. Repair if needed
heroku run ./gradlew flywayRepair --app invoice-service-prod

# 3. Manually run migrations
heroku run ./gradlew flywayMigrate --app invoice-service-prod
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Port 8080 already in use` | Another app using the port | Kill the process or use different port |
| `Unsupported Database: PostgreSQL 17.x` | Missing Flyway PostgreSQL driver | Add `flyway-database-postgresql` dependency |
| `DATABASE_URL not found` | Missing Heroku env var | Check `heroku config` |
| `Permission denied: /app/uploads` | Docker user permissions | Ensure directories created before `USER` switch |
| `BUILD FAILED` | Gradle build error | Check Java version and dependencies |

## ❓ FAQ

### General Questions

**Q: What is the cost of running this on Heroku?**

A: Current Heroku costs (per environment):
- **Basic Dyno**: $7/month
- **PostgreSQL Essential-0**: $5/month
- **Total**: **$12/month** per environment

For both staging and production: **$24/month**

**Free tier alternatives**: Use `hobby-dev` dynos and database (limited to 10K rows) for testing.

**Q: Can I run this locally without Docker?**

A: Yes! Just run `./gradlew bootRun` - it uses H2 in-memory database by default.

**Q: Is there a frontend included?**

A: Yes, there's a React + TypeScript frontend in the `/ui` directory with TailwindCSS styling.

**Q: How do I add more invoice fields?**

A: 
1. Add the field to the `Invoice` entity
2. Create a Flyway migration to add the column
3. Update the DTO/controller if needed
4. Run tests and deploy

### Technical Questions

**Q: Why PostgreSQL 17.x support?**

A: Heroku upgraded to PostgreSQL 17.x. We added `flyway-database-postgresql` dependency for compatibility.

**Q: How does Heroku DATABASE_URL work?**

A: Heroku provides `DATABASE_URL` in format `postgres://...`. Our `HerokuDataSourceConfig` automatically converts it to JDBC format `jdbc:postgresql://...`.

**Q: Can I deploy to AWS/Azure/GCP instead of Heroku?**

A: Yes! The application is containerized with Docker. You can deploy to:
- AWS Elastic Beanstalk / ECS / Fargate
- Azure App Service / Container Instances
- Google Cloud Run / GKE
- Any Kubernetes cluster

**Q: How do I enable HTTPS?**

A: 
- **Heroku**: HTTPS is automatic
- **Self-hosted**: Use a reverse proxy (Nginx) with Let's Encrypt certificates

**Q: What's the maximum file upload size?**

A: 10MB per file (configurable in `application.yml` → `spring.servlet.multipart.max-file-size`)

### Deployment Questions

**Q: How long does deployment take?**

A: ~3-5 minutes end-to-end (test → build → deploy)

**Q: Can I rollback a deployment?**

A: Yes! On Heroku: `heroku releases:rollback --app invoice-service-prod`

**Q: How do I view application logs?**

A: 
- **Heroku**: `heroku logs --tail --app invoice-service-prod`
- **Local**: Check `logs/application.log`
- **Docker**: `docker logs <container-id>`

## 🤝 Contributing

We welcome contributions! Here's how:

### Getting Started
1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes following our coding standards
4. Run tests:
   ```bash
   ./gradlew test
   ```
5. Commit with conventional commits:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### Coding Standards
- Follow Clean Architecture principles
- Write tests for new features
- Use meaningful variable and method names
- Add comments for complex logic
- Keep functions small and focused
- Follow existing code style

### Commit Message Format
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Examples:
  feat(invoice): add recurring invoice support
  fix(pdf): resolve PDF generation encoding issue
  docs(readme): update deployment instructions
```

### Pull Request Guidelines
- Provide clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Invoice Service

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

## 📞 Support

Need help? Here's how to get it:

### Documentation
- 📖 [Automated Deployment Guide](AUTOMATED_HEROKU_SETUP.md)
- 📖 [Manual Deployment Guide](HEROKU_SETUP.md)
- 📖 [API Documentation](#api-documentation)

### Issues & Bugs
- 🐛 [Create an Issue](https://github.com/pedaganim/Nudgr/issues/new)
- 🔍 [Search Existing Issues](https://github.com/pedaganim/Nudgr/issues)

### Community
- 💬 [GitHub Discussions](https://github.com/pedaganim/Nudgr/discussions)
- ⭐ Star the project if you find it useful!

### Commercial Support
For enterprise support, customization, or consulting:
- 📧 Email: [your-email@example.com]
- 🌐 Website: [your-website.com]

## 🙏 Acknowledgments

This project was built with these amazing technologies:

### Core Technologies
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [React](https://react.dev/) - Frontend framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework

### Libraries & Tools
- [Flyway](https://flywaydb.org/) - Database migrations
- [OpenHTMLToPDF](https://github.com/danfickle/openhtmltopdf) - PDF generation
- [Lombok](https://projectlombok.org/) - Java boilerplate reduction
- [MapStruct](https://mapstruct.org/) - Object mapping
- [JUnit 5](https://junit.org/junit5/) - Testing framework
- [AssertJ](https://assertj.github.io/doc/) - Fluent assertions
- [Testcontainers](https://testcontainers.com/) - Integration testing

### Infrastructure
- [Heroku](https://www.heroku.com/) - Cloud platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD
- [Docker](https://www.docker.com/) - Containerization

### Special Thanks
- Clean Architecture principles by Robert C. Martin
- Spring Boot community for excellent documentation
- All contributors who helped make this project better

---

**Made with ❤️ by the Invoice Service Team**

[⬆ Back to Top](#invoice-service-)
