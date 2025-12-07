# GCP Setup Guide

This guide details the step-by-step process to set up Google Cloud Platform (GCP) for the Nudgr Invoice Service, including Workload Identity Federation, Cloud Run, and Secret Manager.

## Prerequisites

- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
- A Google Cloud Project.
- GitHub Repository Admin access.

## 1. Environment Setup

Set these variables in your terminal for easy copy-pasting of subsequent commands:

```bash
export PROJECT_ID="invoice-service-477107" # Replace with your actual Project ID
export REGION="australia-southeast1" # Or your preferred region
export REPO_NAME="nudgr-repo"
export SERVICE_ACCOUNT="github-actions-sa"
export POOL_NAME="github-pool"
export PROVIDER_NAME="github-provider"
export GITHUB_REPO="pedaganim/Nudgr" # Replace with your username/repo
```

Initialize `gcloud`:

```bash
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
```

## 2. Enable APIs

Enable the necessary Google Cloud APIs:

```bash
gcloud services enable \
  iam.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iamcredentials.googleapis.com
```

## 3. Create Artifact Registry

Create a repository to store Docker images:

```bash
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for Nudgr"
```

## 4. Setup Workload Identity Federation

This allows GitHub Actions to deploy without using long-lived JSON keys.

### Create Pool

```bash
gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### Create Provider

```bash
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$GITHUB_REPO'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### Get the Provider Resource Name

**Save this output**, you will need it for the GitHub Secret `GCP_WORKLOAD_IDENTITY_PROVIDER`:

```bash
gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --format="value(name)"
```
*(It looks like: `projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider`)*

## 5. Create Service Account

Create the service account that GitHub Actions will impersonate:

```bash
gcloud iam service-accounts create $SERVICE_ACCOUNT \
  --display-name="GitHub Actions Service Account"
```

**Save this output**, you will need it for the GitHub Secret `GCP_SERVICE_ACCOUNT`:

```bash
echo "${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"
```

### Grant Permissions

Grant necessary roles to the Service Account:

```bash
# Cloud Run Admin (to deploy)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Artifact Registry Writer (to push images)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Service Account User (to run the service)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
  
# Secret Manager Access (to read DB secrets)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Bind Service Account to Workload Identity

Allow the GitHub repository to impersonate this service account:

```bash
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$GITHUB_REPO"
```

## 6. Database Setup (Cloud SQL)

Since Cloud Run is stateless, you need a managed database.

1.  **Create Instance**: Go to [Cloud SQL Instances](https://console.cloud.google.com/sql/instances) and create a PostgreSQL instance.
2.  **Create Database**: Create a database named `invoice_db`.
3.  **Create User**: Create a user (e.g., `appuser`) with a password.

### Store Credentials in Secret Manager

For security, store database credentials in Secret Manager:

```bash
# Database URL (jdbc:postgresql://<instance-connection-name>/invoice_db)
# Note: For Cloud Run, use the Unix socket path: jdbc:postgresql:///<db_name>?socketFactory=com.google.cloud.sql.postgres.SocketFactory&cloudSqlInstance=<project:region:instance>
# OR use the internal IP if you configured VPC Connector.
# EASIEST WAY: Standard public IP connection requires SSL or authorized networks. 
# RECOMMENDED FOR CLOUD RUN: Use the Cloud SQL Auth Proxy automatically via socket factory.
# URL syntax: jdbc:postgresql:///invoice_db?cloudSqlInstance=PROJECT:REGION:INSTANCE&socketFactory=com.google.cloud.sql.postgres.SocketFactory&user=appuser&password=password
# However, we will inject user/pass separately.

# Create secrets
echo -n "jdbc:postgresql:///invoice_db?cloudSqlInstance=YOUR_INSTANCE_CONNECTION_NAME&socketFactory=com.google.cloud.sql.postgres.SocketFactory" | \
gcloud secrets create DB_URL --data-file=-

echo -n "appuser" | \
gcloud secrets create DB_USER --data-file=-

echo -n "your-secure-password" | \
gcloud secrets create DB_PASS --data-file=-
```

**Important**: Make sure the `invoice-service-prod` Cloud Run service (once created) or the Service Account has `roles/cloudsql.client`.

**Important**: The **Cloud Run service** itself needs access to these secrets. By default, Cloud Run uses the Compute Engine default service account.

```bash
# Get your project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant Secret Manager Accessor to the Cloud Run default service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant Cloud SQL Client role (if not already present)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

## 7. GitHub Repository Secrets

Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions -> **New repository secret**.

Add the following:

| Name | Value |
|------|-------|
| `GCP_PROJECT_ID` | Your Project ID (e.g., `my-project-123`) |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | The full resource name from Step 4. |
| `GCP_SERVICE_ACCOUNT` | The email address from Step 5. |

*(Optional, if not using Secret Manager for DB)*: `DB_URL`, `DB_USER`, `DB_PASS`.

## 8. Final Verification

1.  Push code to `develop` or `main`.
2.  Watch the GitHub Action.
3.  Upon success, check the Cloud Run console for the Service URL.
