#!/bin/bash

# AWS Deployment Script for Sayz Survey Platform
# This script automates the deployment process to AWS

set -e  # Exit on any error

echo "🚀 Starting AWS Deployment for Sayz Survey Platform"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}Checking requirements...${NC}"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}AWS CLI is not installed. Please install it first:${NC}"
        echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed. Please install npm first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

# Configure AWS credentials
configure_aws() {
    echo -e "${BLUE}Configuring AWS credentials...${NC}"
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${YELLOW}AWS credentials not configured. Please run:${NC}"
        echo "aws configure"
        echo ""
        echo "You'll need:"
        echo "- AWS Access Key ID"
        echo "- AWS Secret Access Key"
        echo "- Default region (recommend: us-east-1)"
        echo "- Default output format: json"
        exit 1
    fi
    
    echo -e "${GREEN}✓ AWS credentials configured${NC}"
}

# Create DynamoDB tables
create_dynamodb_tables() {
    echo -e "${BLUE}Creating DynamoDB tables...${NC}"
    
    REGION=$(aws configure get region)
    if [ -z "$REGION" ]; then
        REGION="us-east-1"
    fi
    
    # Array of table names
    TABLES=("sayz-users" "sayz-surveys" "sayz-questions" "sayz-responses" "sayz-answers" "sayz-reminders")
    
    for table in "${TABLES[@]}"; do
        echo "Creating table: $table"
        
        # Check if table already exists
        if aws dynamodb describe-table --table-name "$table" --region "$REGION" &> /dev/null; then
            echo -e "${YELLOW}Table $table already exists, skipping...${NC}"
        else
            aws dynamodb create-table \
                --table-name "$table" \
                --attribute-definitions AttributeName=id,AttributeType=S \
                --key-schema AttributeName=id,KeyType=HASH \
                --billing-mode PAY_PER_REQUEST \
                --region "$REGION"
            
            echo -e "${GREEN}✓ Created table: $table${NC}"
        fi
    done
    
    echo -e "${GREEN}✓ DynamoDB tables ready${NC}"
}

# Create environment file for production
create_env_file() {
    echo -e "${BLUE}Creating production environment configuration...${NC}"
    
    # Get AWS account info
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
    AWS_REGION=$(aws configure get region)
    if [ -z "$AWS_REGION" ]; then
        AWS_REGION="us-east-1"
    fi
    
    # Generate a random NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    cat > .env.production << EOF
# AWS Configuration
AWS_REGION=$AWS_REGION
USE_DYNAMODB=true

# DynamoDB Table Names
DYNAMODB_USERS_TABLE=sayz-users
DYNAMODB_SURVEYS_TABLE=sayz-surveys
DYNAMODB_QUESTIONS_TABLE=sayz-questions
DYNAMODB_RESPONSES_TABLE=sayz-responses
DYNAMODB_ANSWERS_TABLE=sayz-answers
DYNAMODB_REMINDERS_TABLE=sayz-reminders

# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://YOUR_DOMAIN_HERE.amplifyapp.com

# Email Configuration (Update with your SMTP settings)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio Configuration (Optional - for voice surveys)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# Google Gemini API (for AI question generation)
# GEMINI_API_KEY=your_gemini_api_key
EOF
    
    echo -e "${GREEN}✓ Created .env.production file${NC}"
    echo -e "${YELLOW}⚠️  Please update the following in .env.production:${NC}"
    echo "   - NEXTAUTH_URL (after getting your Amplify domain)"
    echo "   - EMAIL_* settings for your SMTP provider"
    echo "   - Optional: TWILIO_* and GEMINI_API_KEY"
}

# Install AWS Amplify CLI
install_amplify() {
    echo -e "${BLUE}Installing AWS Amplify CLI...${NC}"
    
    if ! command -v amplify &> /dev/null; then
        npm install -g @aws-amplify/cli
        echo -e "${GREEN}✓ Amplify CLI installed${NC}"
    else
        echo -e "${GREEN}✓ Amplify CLI already installed${NC}"
    fi
}

# Initialize Amplify project
init_amplify() {
    echo -e "${BLUE}Initializing Amplify project...${NC}"
    
    if [ ! -d "amplify" ]; then
        echo "Initializing Amplify project..."
        amplify init --yes
        echo -e "${GREEN}✓ Amplify project initialized${NC}"
    else
        echo -e "${GREEN}✓ Amplify project already initialized${NC}"
    fi
}

# Add hosting to Amplify
add_hosting() {
    echo -e "${BLUE}Adding hosting to Amplify...${NC}"
    
    amplify add hosting --yes
    echo -e "${GREEN}✓ Hosting added to Amplify${NC}"
}

# Build and deploy
deploy() {
    echo -e "${BLUE}Building and deploying application...${NC}"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Build the application
    echo "Building application..."
    npm run build
    
    # Deploy to Amplify
    echo "Deploying to AWS Amplify..."
    amplify publish --yes
    
    echo -e "${GREEN}✓ Application deployed successfully!${NC}"
}

# Print deployment info
print_deployment_info() {
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "===================="
    
    # Get the Amplify app URL
    APP_URL=$(amplify status | grep "Current Environment" -A 10 | grep "Hosting endpoint" | awk '{print $3}')
    
    if [ ! -z "$APP_URL" ]; then
        echo -e "${BLUE}Your app is live at: ${GREEN}$APP_URL${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update NEXTAUTH_URL in your environment variables with your live URL"
    echo "2. Configure your email settings for survey distribution"
    echo "3. Add your Gemini API key for AI question generation"
    echo "4. Test all features in production"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "- View app status: amplify status"
    echo "- Update deployment: amplify publish"
    echo "- View logs: amplify console"
    echo "- Delete app: amplify delete"
}

# Main execution
main() {
    check_requirements
    configure_aws
    create_dynamodb_tables
    create_env_file
    install_amplify
    init_amplify
    add_hosting
    deploy
    print_deployment_info
}

# Handle script interruption
trap 'echo -e "\n${RED}Deployment interrupted. You can resume by running this script again.${NC}"; exit 1' INT

# Run main function
main

echo -e "${GREEN}AWS deployment script completed successfully!${NC}"