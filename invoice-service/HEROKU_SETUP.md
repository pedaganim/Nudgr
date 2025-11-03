# Heroku Deployment Setup Guide

## Summary
This guide will walk you through deploying your Invoice Service to Heroku with automated GitHub Actions CI/CD.

---

## Prerequisites
- Heroku account (✅ You have this)
- Heroku CLI installed
- GitHub repository with your code

---

## Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli

# Verify installation
heroku --version

# Login to Heroku
heroku login
```

---

## Step 2: Get Your Heroku API Key

### Option A: Via CLI (Recommended)
```bash
heroku auth:token
```
Copy the token that appears.

### Option B: Via Dashboard
1. Go to https://dashboard.heroku.com/account
2. Scroll to "API Key" section
3. Click "Reveal" and copy the key

**Save this key - you'll need it for GitHub!**

---

## Step 3: Create Heroku Apps

```bash
# Create production app
heroku create invoice-service-prod

# Create staging app (optional but recommended)
heroku create invoice-service-staging

# Verify apps were created
heroku apps
```

**Note the app names!** They must match what's in your workflow file:
- Production: `invoice-service-prod`
- Staging: `invoice-service-staging`

If you want different names, update `.github/workflows/ci-cd.yml` lines 120 and 156.

---

## Step 4: Add PostgreSQL Database

```bash
# Add database to production app
heroku addons:create heroku-postgresql:mini -a invoice-service-prod

# Add database to staging app
heroku addons:create heroku-postgresql:mini -a invoice-service-staging

# Verify database was created
heroku addons -a invoice-service-prod
```

**Database Plans:**
- `mini` - $5/month, 10M rows
- `basic` - $9/month, 10M rows
- `hobby-dev` - FREE but limited (good for testing)

To use free tier:
```bash
heroku addons:create heroku-postgresql:hobby-dev -a invoice-service-prod
```

---

## Step 5: Configure Environment Variables on Heroku

```bash
# Set production environment variables
heroku config:set SPRING_PROFILES_ACTIVE=prod -a invoice-service-prod
heroku config:set APP_UPLOADS_DIR=/tmp/uploads -a invoice-service-prod

# Set staging environment variables
heroku config:set SPRING_PROFILES_ACTIVE=prod -a invoice-service-staging
heroku config:set APP_UPLOADS_DIR=/tmp/uploads -a invoice-service-staging

# View all config
heroku config -a invoice-service-prod
```

**Note:** Heroku automatically sets `DATABASE_URL`. Our app will auto-configure from it.

---

## Step 6: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these two secrets:

### Secret 1: HEROKU_API_KEY
- **Name:** `HEROKU_API_KEY`
- **Value:** The API key from Step 2
- Click "Add secret"

### Secret 2: HEROKU_EMAIL
- **Name:** `HEROKU_EMAIL`
- **Value:** Your Heroku account email
- Click "Add secret"

---

## Step 7: Set Stack to Container

```bash
# Set Heroku to use Docker
heroku stack:set container -a invoice-service-prod
heroku stack:set container -a invoice-service-staging
```

---

## Step 8: Deploy!

### Option A: Deploy via GitHub (Automated)

```bash
# Push to main branch for production deployment
git add .
git commit -m "Configure Heroku deployment"
git push origin main

# Or push to develop branch for staging deployment
git push origin develop
```

Go to GitHub → Actions tab to watch the deployment.

### Option B: Manual Deploy (Testing)

```bash
# Deploy production manually
heroku container:login
docker build -t invoice-service .
docker tag invoice-service registry.heroku.com/invoice-service-prod/web
docker push registry.heroku.com/invoice-service-prod/web
heroku container:release web -a invoice-service-prod

# View logs
heroku logs --tail -a invoice-service-prod
```

---

## Step 9: Verify Deployment

### Check App Status
```bash
heroku ps -a invoice-service-prod
```

### Open App in Browser
```bash
heroku open -a invoice-service-prod
```

Or visit: https://invoice-service-prod.herokuapp.com

### Check Health Endpoint
```bash
curl https://invoice-service-prod.herokuapp.com/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

---

## Troubleshooting

### View Logs
```bash
# Real-time logs
heroku logs --tail -a invoice-service-prod

# Last 200 lines
heroku logs -n 200 -a invoice-service-prod

# Filter by source
heroku logs --source app -a invoice-service-prod
```

### Common Issues

#### 1. App Crashes on Startup
```bash
# Check logs
heroku logs --tail -a invoice-service-prod

# Common causes:
# - Database not connected
# - Port not configured correctly
# - Missing environment variables
```

#### 2. Database Connection Issues
```bash
# Check DATABASE_URL is set
heroku config -a invoice-service-prod | grep DATABASE_URL

# Run database migrations manually if needed
heroku run ./gradlew flywayMigrate -a invoice-service-prod
```

#### 3. GitHub Action Fails
- Verify secrets are set correctly in GitHub
- Check Heroku app names match in workflow file
- Ensure Heroku stack is set to `container`

#### 4. "No web process running"
```bash
# Scale up the web dyno
heroku ps:scale web=1 -a invoice-service-prod
```

---

## Monitoring & Maintenance

### View App Metrics
```bash
# Dashboard
heroku dashboard -a invoice-service-prod

# Or visit: https://dashboard.heroku.com/apps/invoice-service-prod
```

### Scale Dynos
```bash
# Scale to 2 dynos for high availability
heroku ps:scale web=2 -a invoice-service-prod

# Scale back to 1
heroku ps:scale web=1 -a invoice-service-prod
```

### Database Backups
```bash
# Create manual backup
heroku pg:backups:capture -a invoice-service-prod

# List backups
heroku pg:backups -a invoice-service-prod

# Download backup
heroku pg:backups:download -a invoice-service-prod
```

### View Database Info
```bash
heroku pg:info -a invoice-service-prod
```

---

## Cost Estimate

### Free Tier (Good for Testing)
- Eco Dynos: $5/month for 1000 dyno hours (shared across apps)
- PostgreSQL Hobby Dev: FREE (10,000 rows limit)
- **Total:** ~$5/month

### Production Setup (Recommended)
- Basic Dynos: $7/month per dyno
- PostgreSQL Mini: $5/month
- **Total:** ~$12/month per environment

### With Staging
- Production: $12/month
- Staging: $12/month
- **Total:** ~$24/month

---

## Useful Commands

```bash
# Restart app
heroku restart -a invoice-service-prod

# Run one-off commands
heroku run bash -a invoice-service-prod

# Access database
heroku pg:psql -a invoice-service-prod

# View environment variables
heroku config -a invoice-service-prod

# Set environment variable
heroku config:set VAR_NAME=value -a invoice-service-prod

# Remove environment variable
heroku config:unset VAR_NAME -a invoice-service-prod

# View releases history
heroku releases -a invoice-service-prod

# Rollback to previous release
heroku rollback -a invoice-service-prod
```

---

## Continuous Deployment Flow

Once set up, your deployment flow will be:

### Staging Deployment
1. Push code to `develop` branch
2. GitHub Actions runs tests
3. Builds Docker image
4. Deploys to `invoice-service-staging`
5. Test at: https://invoice-service-staging.herokuapp.com

### Production Deployment
1. Merge `develop` into `main` (via PR)
2. GitHub Actions runs tests
3. Builds Docker image
4. Deploys to `invoice-service-prod`
5. Live at: https://invoice-service-prod.herokuapp.com

---

## Security Best Practices

1. ✅ API keys stored in GitHub Secrets (not in code)
2. ✅ Database credentials auto-managed by Heroku
3. ✅ HTTPS enabled by default
4. ⚠️ **TODO:** Enable 2FA on your Heroku account
5. ⚠️ **TODO:** Set up monitoring alerts
6. ⚠️ **TODO:** Configure custom domain with SSL

---

## Next Steps

1. **Custom Domain** (Optional)
   ```bash
   heroku domains:add www.yourdomain.com -a invoice-service-prod
   ```
   Then add CNAME record in your DNS settings.

2. **Enable Metrics** (Optional)
   ```bash
   heroku labs:enable "runtime-dyno-metadata" -a invoice-service-prod
   ```

3. **Add-ons** (Optional)
   - Papertrail (logging): `heroku addons:create papertrail -a invoice-service-prod`
   - New Relic (monitoring): `heroku addons:create newrelic -a invoice-service-prod`
   - SendGrid (email): `heroku addons:create sendgrid -a invoice-service-prod`

---

## Support

- **Heroku Docs:** https://devcenter.heroku.com
- **Status:** https://status.heroku.com
- **Support:** https://help.heroku.com

## Quick Reference

| What | Command |
|------|---------|
| View apps | `heroku apps` |
| View logs | `heroku logs --tail -a APP_NAME` |
| Restart | `heroku restart -a APP_NAME` |
| Open in browser | `heroku open -a APP_NAME` |
| Database console | `heroku pg:psql -a APP_NAME` |
| View config | `heroku config -a APP_NAME` |
| Rollback | `heroku rollback -a APP_NAME` |

---

**You're all set! 🚀**

Your deployment pipeline is ready. Just add the secrets to GitHub and push your code!
