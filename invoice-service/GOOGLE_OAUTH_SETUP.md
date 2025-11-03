# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Invoice Service, enabling users to login with their Gmail account and send invoices via email.

## 📋 Prerequisites

- Google Cloud Console account
- Invoice Service application running (local or Heroku)

---

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `invoice-service` (or your preferred name)
4. Click **"Create"**

---

## 🔑 Step 2: Enable Gmail API

1. In Google Cloud Console, ensure your project is selected
2. Go to **APIs & Services** → **Library**
3. Search for **"Gmail API"**
4. Click on **Gmail API** → Click **"Enable"**

---

## 🛡️ Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (for testing) or **"Internal"** (for organization use only)
3. Click **"Create"**

### Fill in the Application Information:
- **App name**: `Invoice Service`
- **User support email**: Your email address
- **App logo**: (Optional) Upload your company logo
- **Application home page**: 
  - Local: `http://localhost:8080`
  - Heroku: `https://invoice-service-prod-2256fd5e6c34.herokuapp.com`
- **Authorized domains**: 
  - For Heroku: Add `herokuapp.com`
- **Developer contact information**: Your email address

4. Click **"Save and Continue"**

### Add Scopes:
5. Click **"Add or Remove Scopes"**
6. Add these scopes:
   - `../auth/userinfo.email` - View your email address
   - `../auth/userinfo.profile` - View your basic profile info
   - `https://www.googleapis.com/auth/gmail.send` - Send email on your behalf
7. Click **"Update"** → **"Save and Continue"**

### Add Test Users (for External apps):
8. Click **"Add Users"**
9. Add email addresses of users who can test (yourself and team members)
10. Click **"Save and Continue"**

11. Click **"Back to Dashboard"**

---

## 🔐 Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **Application type**: `Web application`
4. Enter **Name**: `Invoice Service Web Client`

### Add Authorized Redirect URIs:

**For Local Development:**
```
http://localhost:8080/login/oauth2/code/google
```

**For Heroku Production:**
```
https://invoice-service-prod-2256fd5e6c34.herokuapp.com/login/oauth2/code/google
```

**For Heroku Staging:**
```
https://invoice-service-staging.herokuapp.com/login/oauth2/code/google
```

5. Click **"Create"**

### Save Your Credentials:
6. Copy the **Client ID** and **Client Secret** that appear
7. **Store them securely** - you'll need them next!

---

## 🖥️ Step 5: Configure Local Development

### Set Environment Variables:

**Option A: Using `.env` file (not committed to git):**
```bash
export GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

**Option B: In your IDE:**
- IntelliJ IDEA: Run → Edit Configurations → Environment variables
- VS Code: Create `.env` file and use dotenv extension

**Option C: Command line:**
```bash
export GOOGLE_CLIENT_ID="your-client-id-here"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"

# Then run the app
./gradlew bootRun
```

---

## ☁️ Step 6: Configure Heroku Deployment

### Set Heroku Environment Variables:

```bash
# Production
heroku config:set GOOGLE_CLIENT_ID="your-client-id" --app invoice-service-prod
heroku config:set GOOGLE_CLIENT_SECRET="your-client-secret" --app invoice-service-prod

# Staging
heroku config:set GOOGLE_CLIENT_ID="your-client-id" --app invoice-service-staging
heroku config:set GOOGLE_CLIENT_SECRET="your-client-secret" --app invoice-service-staging
```

### Or via Heroku Dashboard:
1. Go to https://dashboard.heroku.com/apps/invoice-service-prod
2. Click **"Settings"** tab
3. Click **"Reveal Config Vars"**
4. Add:
   - Key: `GOOGLE_CLIENT_ID`, Value: `your-client-id`
   - Key: `GOOGLE_CLIENT_SECRET`, Value: `your-client-secret`

---

## 🧪 Step 7: Test OAuth Login

### Local Testing:

1. Start the application:
   ```bash
   ./gradlew bootRun
   ```

2. Open browser: `http://localhost:8080`

3. You should see a **"Login with Google"** button

4. Click it → Select your Google account → Grant permissions

5. You'll be redirected back to the app, now logged in

### Test Authentication Endpoint:
```bash
curl http://localhost:8080/api/auth/user --cookie "JSESSIONID=your-session-cookie"
```

Expected response:
```json
{
  "authenticated": true,
  "name": "Your Name",
  "email": "your@gmail.com",
  "picture": "https://..."
}
```

### Heroku Testing:

1. Visit: `https://invoice-service-prod-2256fd5e6c34.herokuapp.com`
2. Click **"Login with Google"**
3. Complete OAuth flow
4. Test sending an invoice email

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem**: The redirect URI doesn't match what's configured in Google Console

**Solution**: 
1. Check Google Console → Credentials → Your OAuth client
2. Ensure redirect URI exactly matches:
   - Local: `http://localhost:8080/login/oauth2/code/google`
   - Heroku: `https://your-app.herokuapp.com/login/oauth2/code/google`
3. No trailing slashes, correct protocol (http vs https)

### Error: "Access blocked: This app's request is invalid"
**Problem**: OAuth consent screen not properly configured

**Solution**:
1. Go to OAuth consent screen
2. Ensure app name, support email are filled
3. Add test users (for External apps)
4. Publish the app (for production use)

### Error: "Insufficient Permission"
**Problem**: Required OAuth scopes not granted

**Solution**:
1. Check OAuth consent screen → Scopes
2. Ensure `gmail.send` scope is added
3. User needs to re-authorize and grant permissions
4. Revoke and re-grant permissions at: https://myaccount.google.com/permissions

### Error: "invalid_client"
**Problem**: Wrong client ID or secret

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
2. Check for typos, extra spaces, or incorrect values
3. Regenerate credentials if needed

### Application can't send emails
**Problem**: Access token doesn't have gmail.send scope

**Solution**:
1. Check `application-local.yml` or `application-heroku.yml`
2. Ensure scope includes: `https://www.googleapis.com/auth/gmail.send`
3. User must logout and login again to get new token with correct scopes

---

## 📊 Production Checklist

Before going to production:

- [ ] OAuth consent screen configured with production URLs
- [ ] Gmail API enabled
- [ ] Authorized redirect URIs include production URL
- [ ] Heroku config vars set (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- [ ] Test users added (for External apps)
- [ ] Privacy policy URL added (required for verification)
- [ ] Terms of service URL added (optional but recommended)
- [ ] App logo uploaded
- [ ] OAuth consent screen published (for public use)

### Publishing for Public Use:

If you want anyone with a Gmail account to use your app:

1. Go to OAuth consent screen
2. Click **"Publish App"**
3. Submit for Google verification (required for > 100 users)
4. Provide required information:
   - App homepage
   - Privacy policy
   - Video demo
   - Justification for sensitive scopes

**Note**: Verification can take 4-6 weeks. During this time, you can add up to 100 test users.

---

## 🔒 Security Best Practices

1. **Never commit credentials to git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Use different OAuth clients for different environments**
   - One for local development
   - One for staging
   - One for production

3. **Regularly rotate secrets**
   - Generate new client secrets periodically
   - Update in all environments

4. **Monitor OAuth usage**
   - Check Google Console → APIs & Services → Dashboard
   - Review quotas and usage

5. **Implement proper logout**
   - Clear sessions
   - Revoke tokens when needed

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Spring Security OAuth2 Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🆘 Support

If you encounter issues:

1. Check Google Cloud Console logs
2. Check application logs: `heroku logs --tail --app invoice-service-prod`
3. Review OAuth consent screen status
4. Verify environment variables are set correctly
5. Test with a simple curl command to `/api/auth/status`

---

**Setup Complete!** 🎉

Users can now login with Google and send invoices via their Gmail account.
