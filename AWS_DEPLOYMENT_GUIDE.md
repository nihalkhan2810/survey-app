# AWS Deployment Guide for Survey Application

## Environment Variables Setup

Since AWS services may have restrictions on environment variable names, use these alternative names:

### Required Environment Variables for AWS Deployment

```env
# DynamoDB Configuration (Alternative Names)
DYNAMODB_REGION=us-east-2
DYNAMODB_ACCESS_KEY_ID=your_access_key_here
DYNAMODB_SECRET_ACCESS_KEY=your_secret_key_here

# Enable DynamoDB
USE_DYNAMODB=true

# DynamoDB Table Names (optional - uses defaults if not set)
DYNAMODB_USERS_TABLE=sayz-users
DYNAMODB_SURVEYS_TABLE=sayz-surveys
DYNAMODB_QUESTIONS_TABLE=sayz-questions
DYNAMODB_RESPONSES_TABLE=sayz-responses
DYNAMODB_ANSWERS_TABLE=sayz-answers
DYNAMODB_REMINDERS_TABLE=sayz-reminders

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-random-secret-here

# Email Configuration (for sending surveys)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio Configuration (for voice surveys)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Salesforce Integration (to be added later)
# SALESFORCE_CONSUMER_KEY=your_key
# SALESFORCE_CONSUMER_SECRET=your_secret
# SALESFORCE_SECURITY_TOKEN=your_token
```

## Pre-Deployment Checklist

- [ ] All environment variables set in AWS
- [ ] DynamoDB tables created
- [ ] NextAuth secret generated
- [ ] Domain configured
- [ ] Email service configured
- [ ] Build tested locally

## Deployment Options

### Option 1: AWS Amplify (Recommended)

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add hosting**
   ```bash
   amplify add hosting
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

### Option 2: Vercel with AWS Integration

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Add Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from the list above

### Option 3: AWS EC2/ECS

1. **Build Docker Image**
   ```bash
   docker build -t survey-app .
   ```

2. **Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin [your-ecr-uri]
   docker tag survey-app:latest [your-ecr-uri]/survey-app:latest
   docker push [your-ecr-uri]/survey-app:latest
   ```

## Important Production Considerations

1. **Security**
   - Never expose credentials in code
   - Use IAM roles when possible
   - Enable HTTPS everywhere

2. **Performance**
   - Enable CloudFront CDN
   - Use DynamoDB auto-scaling
   - Optimize Next.js build

3. **Monitoring**
   - Set up CloudWatch alarms
   - Monitor DynamoDB usage
   - Track error rates

4. **Backup**
   - Enable DynamoDB point-in-time recovery
   - Regular data exports

## Post-Deployment Tasks

1. **Test all features**
   - User registration/login
   - Survey creation
   - Survey submission
   - Results viewing

2. **Set up monitoring**
   - CloudWatch dashboards
   - Error alerting
   - Usage metrics

3. **Configure domain**
   - SSL certificate
   - DNS records
   - CDN setup 