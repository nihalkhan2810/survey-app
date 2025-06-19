# Salesforce Integration Setup Guide

## Environment Variables

Add the following variables to your `.env.local` file:

```env
# Salesforce Integration
SALESFORCE_CONSUMER_KEY=your_consumer_key_here
SALESFORCE_CONSUMER_SECRET=your_consumer_secret_here
SALESFORCE_SECURITY_TOKEN=your_security_token_here
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# For sandbox environments, use:
# SALESFORCE_LOGIN_URL=https://test.salesforce.com
```

## Getting Your Salesforce Credentials

### 1. Consumer Key and Secret (Connected App)
1. Log into Salesforce
2. Go to Setup → Apps → App Manager
3. Click "New Connected App"
4. Fill in:
   - Connected App Name: "Survey Integration"
   - API Name: "Survey_Integration"
   - Contact Email: your email
5. Enable OAuth Settings:
   - Callback URL: `http://localhost:3000/api/salesforce/callback`
   - Selected OAuth Scopes:
     - Access and manage your data (api)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
6. Save and note down:
   - Consumer Key → `SALESFORCE_CONSUMER_KEY`
   - Consumer Secret → `SALESFORCE_CONSUMER_SECRET`

### 2. Security Token
1. Go to your Salesforce profile settings
2. Click "Reset My Security Token"
3. Check your email for the token
4. This is your `SALESFORCE_SECURITY_TOKEN`

## Usage

### Password Authentication
When using the import feature, you'll need to provide:
- **Username**: Your Salesforce email
- **Password**: Your Salesforce password + security token (concatenated)
  - Example: If password is "mypass123" and token is "ABC123", enter "mypass123ABC123"

### OAuth Authentication (Alternative)
Click "Or use OAuth" to authenticate via Salesforce login page.

## Troubleshooting

### Common Errors

1. **"Invalid username, password, security token; or user locked out"**
   - Ensure you're concatenating password + security token
   - Check if your IP is whitelisted in Salesforce
   - Verify the login URL (production vs sandbox)

2. **"No OAuth token"**
   - Connected App may need approval
   - Check OAuth scopes are correctly set

3. **React Hooks Error**
   - This has been fixed by using dynamic imports
   - Clear your browser cache and restart the dev server

## Security Notes

- Never commit `.env.local` to version control
- The default password for imported users is "salesforce123" - they should change it on first login
- Consider implementing password reset emails for imported users 