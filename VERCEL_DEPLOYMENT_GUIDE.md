# Vercel Deployment Guide

## Quick Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

Follow the prompts:
- Link to existing project? **No** (first time)
- What's your project's name? **survey-app** (or your preferred name)
- In which directory is your code located? **./** (current directory)
- Want to override the settings? **No**

### 3. Set Environment Variables in Vercel Dashboard

After deployment, go to your Vercel dashboard:

1. Go to **https://vercel.com/dashboard**
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
DYNAMODB_REGION=us-east-2
DYNAMODB_ACCESS_KEY_ID=your_aws_access_key
DYNAMODB_SECRET_ACCESS_KEY=your_aws_secret_key
USE_DYNAMODB=true
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=generate-random-32-char-string
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Optional - Email
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional - Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Redeploy to Apply Environment Variables
```bash
vercel --prod
```

## Alternative: Deploy via GitHub

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import from GitHub in Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables
4. Deploy!

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

## Important Notes

1. **Domain**: Your app will be at `https://[project-name].vercel.app`
2. **Custom Domain**: You can add your own domain in Vercel settings
3. **DynamoDB**: Your AWS DynamoDB will still work perfectly with Vercel
4. **Free Tier**: Vercel's free tier is generous for most projects

## After Deployment

1. Update your `.env.local` with the production URL:
   ```env
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

2. Test all features:
   - User registration/login
   - Survey creation
   - Survey submission
   - Admin panel

## Troubleshooting

### "Environment variables not working"
- Make sure to redeploy after adding environment variables
- Check that variable names match exactly

### "Authentication not working"
- Ensure NEXTAUTH_URL matches your Vercel URL exactly
- NEXTAUTH_SECRET must be set

### "DynamoDB connection failed"
- Verify AWS credentials are correct
- Check USE_DYNAMODB=true is set

## Monitoring

Vercel provides free analytics and logs:
- **Functions**: See API route performance
- **Analytics**: Track page views and performance
- **Logs**: Debug issues in real-time 