# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linter

### Database Setup
- `npm run create-tables` - Create DynamoDB tables and demo users
- `npm run setup-db` - Legacy setup script (use create-tables instead)

### Deployment
- `./scripts/deploy-aws.sh` - Automated AWS Amplify deployment with DynamoDB setup

## Architecture

This is a Next.js 15 survey platform called "Sayz" that allows users to create, distribute, and analyze surveys with AI-powered insights.

### Core Structure
- **Next.js 15 App Router** - Modern app directory with React 19
- **Dual Database Architecture** - Supports both local JSON storage and AWS DynamoDB
- **Authentication** - NextAuth.js with credential-based login
- **Dashboard Layout** - Route groups with shared layout in `(dashboard)`

### Database Architecture
The application supports two storage backends via `src/lib/database.ts`:

#### Local Development (JSON Files)
- Simple JSON file storage in `/data/` directory (legacy)
- Automatic fallback when DynamoDB is not configured

#### Production (AWS DynamoDB)
- Activated when `USE_DYNAMODB=true` and credentials are provided
- Tables: `sayz-users`, `sayz-surveys`, `sayz-questions`, `sayz-responses`, `sayz-answers`, `sayz-reminders`
- Environment variables support both `AWS_*` and `DYNAMODB_*` prefixes for deployment flexibility
- Demo users automatically created: `admin@sayz.com/admin123`, `user@sayz.com/user123`

### Key Environment Variables
- **Database**: `USE_DYNAMODB`, `DYNAMODB_ACCESS_KEY_ID`, `DYNAMODB_SECRET_ACCESS_KEY`, `DYNAMODB_REGION`
- **Authentication**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **Email**: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_PORT`
- **Integrations**: `TWILIO_*`, `SALESFORCE_*`, `GEMINI_API_KEY`
- **Web Search**: `GOOGLE_API_KEY`, `CUSTOM_SEARCH_ENGINE_ID`

### Route Structure
- `/` - Landing page with session-based redirects
- `/(dashboard)/` - Protected routes with shared sidebar layout
  - `/admin` - Admin dashboard
  - `/surveys` - Survey management
  - `/analytics` - Data visualization
- `/auth/signin` and `/auth/signup` - Authentication pages
- `/survey/[surveyId]` - Public survey forms
- `/api/` - REST API endpoints

### Authentication Flow
- NextAuth.js with credentials provider
- User roles: `USER`, `ADMIN`, `MODERATOR`
- Session-based routing: admins → `/admin`, users → `/surveys`
- bcryptjs for password hashing

### API Architecture
- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/surveys/` - Survey CRUD operations
- `/api/generate-questions` - AI question generation via Gemini
- `/api/send-survey` - Email distribution via Nodemailer
- `/api/calls/` - Twilio voice survey integration
- `/api/salesforce/` - Salesforce CRM integration

### Styling and UI
- **Tailwind CSS** with utility-first approach
- **next-themes** for dark/light mode support
- **Framer Motion** for animations
- **Lucide React** icons
- Custom theme system with consistent color palette

### Development Guidelines
Based on Cursor rules in `.cursor/rules/`:
- Latest Next.js 15 features and TypeScript best practices
- Clear, readable code with proper TypeScript typing
- Tailwind CSS for all styling (avoid custom CSS)
- Focus on readability over performance
- No TODO comments or placeholders in production code