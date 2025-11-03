# Fully Automated Heroku Deployment

## Overview
The GitHub Actions workflow now **automatically creates and configures everything** on Heroku. You only need to provide two secrets!

---

## What Gets Automated

The workflow will automatically:
✅ Create Heroku apps (`invoice-service-prod` and `invoice-service-staging`)
✅ Add PostgreSQL database (mini plan - $5/month)
✅ Set container stack
✅ Configure environment variables
✅ Deploy your application

**No manual Heroku CLI commands needed!**

---

## Setup (2 Minutes)

### Step 1: Get Your Heroku API Key

**Option A: Via Heroku Dashboard (Easiest)**
1. Go to https://dashboard.heroku.com/account
2. Scroll to "API Key" section
3. Click "Reveal"
4. Copy the key

**Option B: Via CLI** (if you have it installed)
```bash
heroku auth:token
```

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these two secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `HEROKU_API_KEY` | Your Heroku API key | `abc123...` |
| `HEROKU_EMAIL` | Your Heroku email | `you@email.com` |

### Step 3: Create GitHub Environments (Optional but Recommended)

1. Go to **Settings** → **Environments**
2. Click **"New environment"**
3. Create two environments:
   - `staging`
   - `production`
4. For `production`, enable "Required reviewers" to add manual approval

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Add automated Heroku deployment"
git push origin main
```

**That's it!** 🎉

---

## What Happens When You Push

### On Push to `main` branch:

1. ✅ **Test** - Runs all unit tests
2. ✅ **Build** - Creates JAR file
3. ✅ **Setup Infrastructure** - Creates/configures Heroku app automatically:
   - Creates `invoice-service-prod` (if doesn't exist)
   - Adds PostgreSQL essential-0 addon
   - Sets container stack
   - Configures environment variables
4. ✅ **Deploy** - Deploys to Heroku production
5. ✅ **Live** - App available at: https://invoice-service-prod.herokuapp.com

### On Push to `develop` branch:

Same process but deploys to `invoice-service-staging`

---

## Monitoring Deployment

### View Pipeline in GitHub
Go to: **Repository → Actions tab**

You'll see:
- Test results
- Build status  
- Infrastructure setup progress
- Deployment status

### Check Deployed App

```bash
# Visit in browser
https://invoice-service-prod.herokuapp.com

# Health check
curl https://invoice-service-prod.herokuapp.com/actuator/health
```

---

## What If Something Goes Wrong?

### Check GitHub Actions Logs
1. Go to **Actions** tab
2. Click on the failed run
3. Expand the failed step to see error details

### Common Issues

#### 1. "App name is already taken"
Someone else already has that app name. Either:
- Delete the existing app in Heroku dashboard
- Change the app name in `.github/workflows/ci-cd.yml`

#### 2. "Invalid credentials"
- Double-check your `HEROKU_API_KEY` secret
- Make sure `HEROKU_EMAIL` matches your Heroku account

#### 3. "Insufficient funds"
- PostgreSQL mini requires a payment method on file
- Add credit card to Heroku account (you won't be charged until you use it)
- Or use free `hobby-dev` plan by changing line in workflow:
  ```bash
  heroku addons:create heroku-postgresql:hobby-dev --app invoice-service-prod --wait
  ```

---

## Managing Your Apps (Optional)

### Install Heroku CLI for Manual Management

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Login
heroku login
```

### Useful Commands

```bash
# View apps
heroku apps

# View logs
heroku logs --tail --app invoice-service-prod

# View environment variables
heroku config --app invoice-service-prod

# Restart app
heroku restart --app invoice-service-prod

# Open in browser
heroku open --app invoice-service-prod

# Access database
heroku pg:psql --app invoice-service-prod
```

---

## Cost Breakdown

### Per Environment (Staging or Production)

| Service | Plan | Cost |
|---------|------|------|
| Dyno (App Server) | Basic | $7/month |
| PostgreSQL | Mini | $5/month |
| **Total per environment** | | **$12/month** |

### Both Environments
- Staging: $12/month
- Production: $12/month
- **Total: $24/month**

### Free Tier Option
For testing only:
- Dyno: Eco (shared) - $5/month for 1000 hours
- PostgreSQL: Hobby Dev (FREE but limited to 10K rows)
- **Total: ~$5/month**

To use free PostgreSQL, edit the workflow and change:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

---

## Scaling

The workflow creates apps with minimal resources. To scale:

### Via Heroku Dashboard
1. Go to https://dashboard.heroku.com
2. Select your app
3. Go to Resources tab
4. Upgrade dyno size or add more dynos

### Via CLI
```bash
# Scale to 2 dynos for high availability
heroku ps:scale web=2 --app invoice-service-prod

# Upgrade to Standard dyno ($25/month)
heroku ps:type standard-1x --app invoice-service-prod
```

---

## Rollback

If a deployment breaks something:

### Via GitHub Actions
1. Go to **Actions** tab
2. Find last successful deployment
3. Click "Re-run all jobs"

### Via Heroku CLI
```bash
heroku rollback --app invoice-service-prod
```

---

## Updating App Configuration

To change environment variables or add more addons, edit the workflow file:

**File:** `.github/workflows/ci-cd.yml`

**Setup job sections:**
- Lines 103-144: Staging setup
- Lines 146-187: Production setup

### Example: Add Redis

Add to the setup job:
```yaml
- name: Add Redis
  run: |
    if ! heroku addons:info heroku-redis --app invoice-service-prod 2>/dev/null; then
      heroku addons:create heroku-redis:mini --app invoice-service-prod --wait
    fi
```

### Example: Change PostgreSQL Plan

Change line 135 (staging) or 178 (production):
```bash
heroku addons:create heroku-postgresql:standard-0 --app invoice-service-prod --wait
```

---

## Benefits of Automated Setup

### **Zero Manual Steps**
### ✅ **Zero Manual Steps**
No need to remember Heroku CLI commands

### ✅ **Consistent Environments**
Staging and production configured identically

### ✅ **Version Controlled**
All infrastructure config in Git

### ✅ **Reproducible**
Can recreate environments anytime

### ✅ **Self-Documenting**
Workflow shows exactly what's configured

### ✅ **Idempotent**
Safe to run multiple times, won't create duplicates

---

## Branch Strategy

### `develop` branch → Staging Environment
```bash
git checkout develop
git add .
git commit -m "New feature"
git push origin develop
# Automatically deploys to invoice-service-staging
```

### `main` branch → Production Environment
```bash
git checkout main
git merge develop
git push origin main
# Automatically deploys to invoice-service-prod
```

---

## Security Notes

✅ **Secrets stored in GitHub** (not in code)
✅ **Database credentials auto-managed** by Heroku
✅ **HTTPS enabled** by default
✅ **Environment isolation** (staging ≠ production)

### Recommended: Enable GitHub Environment Protection
1. Go to **Settings → Environments → production**
2. Add required reviewers
3. Now main branch deployments require approval

---

## Comparison: Manual vs Automated

### Manual Setup (Old Way)
```bash
heroku login
heroku create invoice-service-prod
heroku addons:create heroku-postgresql:mini -a invoice-service-prod
heroku stack:set container -a invoice-service-prod
heroku config:set ... -a invoice-service-prod
# Repeat for staging...
```
**Time:** 10-15 minutes  
**Error-prone:** Yes  
**Documented:** No  

### Automated Setup (New Way)
```bash
# Add 2 secrets to GitHub
# Push code
git push origin main
```
**Time:** 2 minutes  
**Error-prone:** No  
**Documented:** Yes (in workflow)  

---

## Next Steps After First Deployment

1. **Add Custom Domain** (Optional)
   ```bash
   heroku domains:add www.yourdomain.com --app invoice-service-prod
   ```

2. **Enable Metrics**
   ```bash
   heroku labs:enable runtime-dyno-metadata --app invoice-service-prod
   ```

3. **Set Up Monitoring** (Recommended)
   - Add Papertrail for logging
   - Add New Relic for APM
   - Set up uptime monitoring (Pingdom, etc.)

4. **Configure Backups**
   ```bash
   heroku pg:backups:schedule --at '02:00 America/New_York' --app invoice-service-prod
   ```

---

## Summary

**What you need to do:**
1. Get Heroku API key (30 seconds)
2. Add 2 secrets to GitHub (1 minute)
3. Push code (30 seconds)

**What happens automatically:**
- ✅ Apps created
- ✅ Database provisioned
- ✅ Environment configured
- ✅ Application deployed
- ✅ Ready to use!

**Total setup time: ~2 minutes** 🚀

No Heroku CLI installation required. No manual commands. Just push and deploy!
