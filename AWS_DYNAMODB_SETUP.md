# AWS DynamoDB Setup Guide for Your Survey Application

## Overview
This guide will walk you through setting up AWS DynamoDB for your survey application. DynamoDB is a serverless, NoSQL database that's perfect for your use case because:
- It scales automatically
- You only pay for what you use
- It's fully managed by AWS
- Perfect for storing survey responses and user data

## Step 1: Create an AWS Account (if you don't have one)
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process
4. You'll need a credit card (but we'll use free tier)

## Step 2: Set Up IAM User for Your Application

### 2.1 Access IAM Console
1. Log into AWS Console
2. Search for "IAM" in the search bar
3. Click on "IAM" (Identity and Access Management)

### 2.2 Create a New User
1. Click "Users" in the left sidebar
2. Click "Create user" button
3. User name: `survey-app-user`
4. Check "Provide user access to the AWS Management Console" (optional)
5. Click "Next"

### 2.3 Set Permissions
1. Select "Attach policies directly"
2. Search for and select these policies:
   - `AmazonDynamoDBFullAccess`
3. Click "Next"
4. Click "Create user"

### 2.4 Create Access Keys
1. Click on the user you just created (`survey-app-user`)
2. Go to "Security credentials" tab
3. Under "Access keys", click "Create access key"
4. Select "Application running outside AWS"
5. Click "Next"
6. Add description: "Survey App DynamoDB Access"
7. Click "Create access key"
8. **IMPORTANT**: Download the CSV file or copy:
   - Access key ID
   - Secret access key
   (You won't be able to see the secret again!)

## Step 3: Create DynamoDB Tables

### Option A: Using AWS Console (Manual)

1. Go to AWS Console
2. Search for "DynamoDB"
3. Click "Create table" for each table below:

#### Users Table
- Table name: `sayz-users`
- Partition key: `id` (String)
- Settings: Use default settings
- Click "Create table"

#### Surveys Table
- Table name: `sayz-surveys`
- Partition key: `id` (String)
- Settings: Use default settings
- Click "Create table"

#### Questions Table
- Table name: `sayz-questions`
- Partition key: `id` (String)
- Settings: Use default settings
- Click "Create table"

#### Responses Table
- Table name: `sayz-responses`
- Partition key: `id` (String)
- Settings: Use default settings
- Click "Create table"

#### Answers Table
- Table name: `sayz-answers`
- Partition key: `id` (String)
- Settings: Use default settings
- Click "Create table"

#### Reminders Table
- Table name: `sayz-reminders`
- Partition key: `id` (String)
- Settings: Use default settings
- Click "Create table"

### Option B: Using the Setup Script (Automated)

1. First, update your `.env.local` file:
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_from_step_2
AWS_SECRET_ACCESS_KEY=your_secret_key_from_step_2

# DynamoDB Table Names (optional, uses defaults if not set)
DYNAMODB_USERS_TABLE=sayz-users
DYNAMODB_SURVEYS_TABLE=sayz-surveys
DYNAMODB_QUESTIONS_TABLE=sayz-questions
DYNAMODB_RESPONSES_TABLE=sayz-responses
DYNAMODB_ANSWERS_TABLE=sayz-answers
DYNAMODB_REMINDERS_TABLE=sayz-reminders
```

2. Remove the local endpoint from the setup script (we'll fix this)
3. Run: `npm run setup-db`

## Step 4: Update Your Application Code

### 4.1 Environment Variables
Add to your `.env.local`:
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# DynamoDB Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
USE_DYNAMODB=true

# Existing Salesforce config...
SALESFORCE_CONSUMER_KEY=your_key
# etc...
```

### 4.2 Code Updates Needed
I'll update your code to:
1. Remove local DynamoDB endpoint
2. Use real AWS DynamoDB
3. Replace simple-db with DynamoDB operations

## Step 5: Cost Considerations

### DynamoDB Free Tier (First 12 months)
- 25 GB of storage
- 25 read capacity units
- 25 write capacity units
- Enough for ~200 million requests per month

### After Free Tier
- Storage: $0.25 per GB per month
- On-demand pricing: $0.25 per million write requests, $0.25 per million read requests
- For a survey app with moderate usage: ~$5-10/month

## Step 6: Security Best Practices

1. **Never commit `.env.local` to git**
2. **Use IAM roles in production** (when deploying to AWS)
3. **Enable point-in-time recovery** for important tables
4. **Set up CloudWatch alarms** for unusual activity

## Step 7: Testing Your Setup

After setup, test with:
```bash
npm run dev
```

Then:
1. Go to http://localhost:3000/auth/signup
2. Create a new account
3. Check AWS DynamoDB console - you should see the user in the `sayz-users` table

## Common Issues

### "Invalid credentials" error
- Double-check your AWS access keys in `.env.local`
- Ensure no extra spaces or quotes

### "Table not found" error
- Tables may take a few seconds to create
- Check table names match exactly
- Verify AWS region is correct

### High costs
- Enable "On-Demand" billing mode (pay per request)
- Set up billing alerts in AWS

## Next Steps
1. Set up AWS credentials
2. Create tables
3. Update application code
4. Test locally
5. Deploy to AWS (Amplify, EC2, or ECS)

## For Production Deployment
When ready to deploy:
1. Use AWS Amplify for easy deployment
2. Or use EC2/ECS for more control
3. Set up CloudWatch for monitoring
4. Enable backups and point-in-time recovery 