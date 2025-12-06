# Nudgr

**Nudgr** is a production-ready invoice management system designed to streamline billing processes. It features comprehensive invoice handling, customer management, PDF generation, and automated deployment.

## 🔄 Business Flow

The application supports a complete invoicing lifecycle:

1.  **Customer Management**
    *   Create and maintain customer profiles with contact details and billing addresses.
    *   Validate unique emails and track customer history.

2.  **Invoice Creation & Management**
    *   **Drafting**: Create invoices with auto-generated 8-digit numbers.
    *   **Line Items**: Add products/services with dates, quantities, and rates.
    *   **Calculations**: Automatic GST (10%) and total calculation.
    *   **Status Tracking**: Move invoices through `Draft` → `Finalized` → `Paid` or `Cancelled` states.

3.  **Attachments & Evidence**
    *   Upload supporting documents (up to 10MB) to specific invoices.
    *   Securely store and retrieve attachments.

4.  **Output & Delivery**
    *   **PDF Export**: Generate professional PDF invoices using customizable templates.
    *   **Download/Email**: Facilitate delivery to customers.

## 🛠️ Tech Stack

### Backend
*   **Language**: Java 21 (Eclipse Temurin)
*   **Framework**: Spring Boot 3.3.4
    *   Spring Web (REST API)
    *   Spring Data JPA (ORM)
    *   Spring Security (Auth)
*   **Database**: PostgreSQL 17.x (Production), H2 (Local)
*   **Migrations**: Flyway 9.x
*   **PDF Engine**: OpenHTMLToPDF

### Frontend
*   **Framework**: React 18 with TypeScript
*   **Styling**: TailwindCSS
*   **Build Tool**: Vite
*   **State/Data**: TanStack Query

### Infrastructure & DevOps
*   **CI/CD**: GitHub Actions
*   **Containerization**: Docker & Docker Compose
*   **Deployment**: Heroku (Automated)

## 📂 Project Structure

- `invoice-service/`: The core application containing both the Spring Boot backend and the React frontend (`ui/`).

## 🚀 Quick Start

### Prerequisites
- Java 21
- Node.js 18+ (for UI)
- Docker (optional)

### Running Locally

1.  **Backend**:
    ```bash
    cd invoice-service
    ./gradlew bootRun
    ```
    API: `http://localhost:8080`

2.  **Frontend**:
    ```bash
    cd invoice-service/ui
    npm install
    npm run dev
    ```
    UI: `http://localhost:5174`

For more detailed documentation, see the [Invoice Service README](invoice-service/README.md).