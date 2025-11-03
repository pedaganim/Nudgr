# Invoice Service

A comprehensive invoice management system built with Java 21, Spring Boot 3, and modern web technologies.

## Features

- ✅ Invoice CRUD operations with 8-digit auto-generated numbers
- ✅ Customer management with unique email constraint
- ✅ Line items with service date, product/service, and GST calculation
- ✅ Extended invoice fields (billing address, terms, tags, messages)
- ✅ File attachments (up to 10MB)
- ✅ PDF generation and download
- ✅ Email invoice sending
- ✅ Payment tracking
- ✅ Responsive UI with full-width layout
- ✅ RESTful API
- ✅ Unit tests with 36+ test cases
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Docker support
- ✅ Health checks and monitoring

## Tech Stack

### Backend
- **Java 21** (Temurin)
- **Spring Boot 3.3.4**
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Spring Actuator
  - Spring Validation
- **PostgreSQL** (production) / **H2** (development)
- **Flyway** (database migrations)
- **Gradle** (build tool)
- **OpenHTMLToPDF** (PDF generation)

### Frontend
- **React 18** with TypeScript
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **React Router** (navigation)
- **TanStack Query** (data fetching)

### Testing
- **JUnit 5**
- **AssertJ**
- **Mockito**
- **Testcontainers**

### DevOps
- **Docker** & **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Spring Boot Actuator** (monitoring)

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

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active profile (local/prod) | `local` |
| `SPRING_DATASOURCE_URL` | Database connection URL | H2 in-memory |
| `SPRING_DATASOURCE_USERNAME` | Database username | - |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - |
| `APP_UPLOADS_DIR` | Attachment storage directory | `./uploads` |
| `SERVER_PORT` | Application port | `8080` |

### Database Setup (Production)

```sql
CREATE DATABASE invoice_db;
CREATE USER appuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO appuser;
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### Pipeline Stages
1. **Test** - Run all unit and integration tests
2. **Build** - Compile and package the application
3. **Code Quality** - Run code quality checks
4. **Deploy to Staging** - Auto-deploy on push to `develop`
5. **Deploy to Production** - Auto-deploy on push to `main` (with approval)

### Setup
1. Push code to GitHub repository
2. Configure deployment secrets in GitHub Settings → Secrets
3. Pipeline runs automatically on push/PR

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

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

## Roadmap

See [Roadmap Section](#) for planned features including:
- Email integration
- Advanced reporting & analytics
- Recurring invoices
- Customer portal
- Multi-tenancy
- Payment gateway integration

## Troubleshooting

### Application won't start
- Check Java version: `java -version` (should be 21)
- Verify database connection
- Check logs in `logs/application.log`

### Tests fail
- Ensure JUnit Platform Launcher is in dependencies
- Clean build: `./gradlew clean test`

### Docker build fails
- Check Docker is running
- Verify Dockerfile syntax
- Check network connectivity

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Run tests: `./gradlew test`
4. Commit changes: `git commit -am 'Add feature'`
5. Push branch: `git push origin feature/my-feature`
6. Create Pull Request

## License

[Add your license here]

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
- Review application logs

## Acknowledgments

Built with:
- Spring Boot
- React
- TailwindCSS
- OpenHTMLToPDF
- PostgreSQL
