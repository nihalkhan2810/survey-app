# 🚀 Deploy Sayz to AWS - Complete Guide

This guide will walk you through deploying your Sayz survey platform to AWS using AWS Amplify.

## Prerequisites

Before you start, make sure you have:

1. **AWS Account** - Create one at [aws.amazon.com](https://aws.amazon.com)
2. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
3. **Git** - For version control

## Option 1: Automated Deployment (Recommended)

I've created an automated deployment script that handles everything for you.

### Step 1: Run the Deployment Script

```bash
./scripts/deploy-aws.sh
```

This script will:
- ✅ Check all requirements
- ✅ Configure AWS credentials (if needed)
- ✅ Create DynamoDB tables
- ✅ Set up environment variables
- ✅ Install Amplify CLI
- ✅ Deploy your application
- ✅ Provide your live URL

### Step 2: Follow the Prompts

The script will guide you through:
1. AWS credential configuration
2. Region selection (recommend: us-east-1)
3. Amplify project setup

### Step 3: Update Environment Variables

After deployment, update these in your AWS Amplify console:
- `NEXTAUTH_URL` - Your live Amplify URL
- `EMAIL_*` - Your SMTP settings
- `GEMINI_API_KEY` - For AI features (optional)

## Option 2: Manual Deployment

If you prefer manual deployment:

### Step 1: Install AWS CLI

```bash
# macOS
brew install awscli

# Windows
# Download from: https://aws.amazon.com/cli/
```

### Step 2: Configure AWS

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output: `json`

### Step 3: Create DynamoDB Tables

```bash
npm run create-tables
```

### Step 4: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

### Step 5: Initialize Amplify

```bash
amplify init
```

Follow the prompts:
- Project name: `sayz`
- Environment: `prod`
- Editor: Your preferred editor
- AWS Profile: Use default

### Step 6: Add Hosting

```bash
amplify add hosting
```

Choose:
- Hosting with Amplify Console
- Manual deployment

### Step 7: Deploy

```bash
amplify publish
```

## Environment Variables Setup

After deployment, configure these environment variables in AWS Amplify Console:

### Required Variables

```env
# AWS Configuration
AWS_REGION=us-east-1
USE_DYNAMODB=true

# DynamoDB Tables
DYNAMODB_USERS_TABLE=sayz-users
DYNAMODB_SURVEYS_TABLE=sayz-surveys
DYNAMODB_QUESTIONS_TABLE=sayz-questions
DYNAMODB_RESPONSES_TABLE=sayz-responses
DYNAMODB_ANSWERS_TABLE=sayz-answers
DYNAMODB_REMINDERS_TABLE=sayz-reminders

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app.amplifyapp.com

# Email (for survey distribution)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Optional Variables

```env
# Twilio (for phone surveys)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Gemini (for AI features)
GEMINI_API_KEY=your-gemini-api-key
```

## Setting Environment Variables in Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Go to "App settings" → "Environment variables"
4. Add each variable from above
5. Save and redeploy

## Demo Accounts

Your app comes with pre-configured demo accounts:

- **Admin**: `admin@sayz.com` / `admin123`
- **User**: `user@sayz.com` / `user123`

## Cost Estimation

### DynamoDB (Free Tier)
- First 12 months: **Free**
- 25GB storage, 25 read/write units
- After free tier: ~$5-10/month for typical usage

### AWS Amplify
- First 12 months: 1000 build minutes/month **Free**
- 15GB hosting/month **Free**
- After free tier: ~$1-5/month

### Total Expected Cost
- **First year**: Free (within limits)
- **After first year**: $5-15/month

## Troubleshooting

### Common Issues

#### "Invalid credentials" Error
```bash
# Check your AWS credentials
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

#### "Table not found" Error
```bash
# Recreate tables
npm run create-tables
```

#### Build Fails
```bash
# Check your environment variables in Amplify Console
# Make sure all required variables are set
```

#### 404 Errors
1. Check NEXTAUTH_URL matches your live domain
2. Verify all environment variables are set
3. Redeploy the application

### Getting Help

If you run into issues:

1. Check the AWS Amplify build logs
2. Verify all environment variables are set correctly
3. Make sure DynamoDB tables exist in your AWS region
4. Check AWS billing dashboard for any limits

## Post-Deployment Checklist

After successful deployment:

- [ ] Test user registration
- [ ] Test survey creation
- [ ] Test survey responses
- [ ] Configure email settings
- [ ] Test email distribution
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

## Next Steps

1. **Custom Domain**: Add your own domain in Amplify Console
2. **SSL Certificate**: Automatically handled by Amplify
3. **Monitoring**: Set up CloudWatch alarms
4. **Backups**: Enable DynamoDB point-in-time recovery
5. **Scaling**: Configure auto-scaling for high traffic

## Support

Your application is now live on AWS! 🎉

For any issues or questions, check:
- AWS Amplify Console logs
- DynamoDB tables in AWS Console
- Environment variables configuration

Happy surveying! 📊