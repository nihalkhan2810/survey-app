# Production Debugging Guide

## 🚨 **Critical Issues Identified & Fixed**

Based on your environment variables and codebase analysis, I've identified and fixed several critical issues that were causing your app to fail silently in production:

### 1. **NextAuth Configuration Problems** ✅ FIXED
- **Issue**: Missing `trustHost: true` for production deployment
- **Issue**: No proper error handling in NextAuth configuration
- **Fix**: Added production-specific NextAuth configuration with better error handling

### 2. **Image Domain Configuration** ✅ FIXED
- **Issue**: `next.config.js` only allowed images from `localhost`
- **Fix**: Added your server IP (`3.133.91.18`) and wildcard domains

### 3. **Environment Variable Fallbacks** ✅ FIXED
- **Issue**: Multiple fallbacks to `localhost:3000` in production
- **Fix**: Better environment variable handling throughout the app

### 4. **Silent Error Handling** ✅ FIXED
- **Issue**: Database and authentication errors were failing silently
- **Fix**: Added comprehensive error logging and debugging information

## 🔧 **Immediate Steps to Deploy Fixes**

### Step 1: Deploy the Fixed Code
```bash
# On your server
cd /survey-app
git pull origin master  # or however you deploy your code
npm run build
pm2 restart all
```

### Step 2: Run the Debugging Script
```bash
# On your server
node scripts/test-deployment.js
```

### Step 3: Check Health Endpoint
```bash
# Test locally on server
curl http://localhost:3000/api/health

# Test externally
curl http://3.133.91.18/api/health
```

## 🔍 **Debugging Commands**

### Check Application Logs
```bash
# PM2 logs (most important)
pm2 logs

# PM2 status
pm2 list

# Restart if needed
pm2 restart all
```

### Check Nginx Configuration
```bash
# Nginx status
sudo systemctl status nginx

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Test Network Connectivity
```bash
# Test if app responds locally
curl -v http://localhost:3000

# Test if Nginx forwards requests
curl -v http://localhost:80

# Test if external access works
curl -v http://3.133.91.18
```

## 🏗️ **Environment Variables Check**

Verify these critical environment variables are set correctly:

```bash
# Check if variables are set
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "USE_DYNAMODB: $USE_DYNAMODB"
echo "NODE_ENV: $NODE_ENV"
```

**Critical Requirements:**
- `NEXTAUTH_URL` must be `http://3.133.91.18` (not localhost)
- `NEXTAUTH_SECRET` must be set to a secure random string
- `USE_DYNAMODB` should be `true`
- `NODE_ENV` should be `production`

## 🔧 **Common Production Issues & Solutions**

### Issue 1: "Cannot GET /" or 404 Errors
**Cause**: Next.js routing not working properly
**Solution**:
```bash
# Rebuild the application
npm run build
pm2 restart all
```

### Issue 2: Authentication Not Working
**Cause**: NextAuth configuration issues
**Solution**: 
- Verify `NEXTAUTH_URL=http://3.133.91.18`
- Verify `NEXTAUTH_SECRET` is set
- Check PM2 logs for NextAuth errors

### Issue 3: Database Errors
**Cause**: DynamoDB connection issues
**Solution**:
```bash
# Test DynamoDB connectivity
node -e "
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  }
});
console.log('DynamoDB client created successfully');
"
```

### Issue 4: Silent Crashes
**Cause**: Unhandled errors in React components
**Solution**: Check the enhanced error logging I added

## 🚀 **Testing Your Fixes**

### 1. Test Local App Response
```bash
curl http://localhost:3000
# Should return HTML content
```

### 2. Test External Access
```bash
curl http://3.133.91.18
# Should return the same HTML content
```

### 3. Test API Endpoints
```bash
curl http://3.133.91.18/api/health
# Should return JSON with status information
```

### 4. Test in Browser
- Navigate to `http://3.133.91.18`
- Check browser console for any JavaScript errors
- Check Network tab for failed requests

## 🐛 **Advanced Debugging**

### Check System Resources
```bash
# Memory usage
free -h

# Disk usage
df -h

# Process usage
top -p $(pgrep -f "node")
```

### Check Node.js Process
```bash
# Check if Node.js is running
ps aux | grep node

# Check which port it's listening on
netstat -tlnp | grep :3000
```

### Enable Verbose Logging
```bash
# Set debug mode (temporarily)
export DEBUG=*
pm2 restart all

# Check logs
pm2 logs

# Disable debug mode
unset DEBUG
pm2 restart all
```

## 📋 **Quick Resolution Checklist**

- [ ] Code changes deployed and built
- [ ] PM2 process restarted
- [ ] `http://localhost:3000` works on server
- [ ] `http://3.133.91.18` works externally
- [ ] `/api/health` endpoint returns valid JSON
- [ ] Environment variables are correct
- [ ] No errors in PM2 logs
- [ ] No errors in Nginx logs

## 🎯 **Most Likely Solution**

Based on your issue description, the **most likely cause** was the NextAuth configuration lacking production settings. The fixes I implemented should resolve:

1. **Silent authentication failures** due to missing `trustHost: true`
2. **Image loading issues** due to restricted domains
3. **Environment variable fallbacks** causing localhost references in production
4. **Lack of error visibility** due to missing error logging

After deploying these fixes, your application should work correctly in production.

## 📞 **If Issues Persist**

If you're still experiencing issues after implementing these fixes, run:

```bash
node scripts/test-deployment.js
curl http://3.133.91.18/api/health | jq
```

And share the output to get more targeted assistance. 