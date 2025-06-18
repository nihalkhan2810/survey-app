# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linter

### Environment Variables
- `GEMINI_API_KEY` - Required for AI-powered question generation

## Architecture

This is a Next.js 15 survey platform called "Sayz" that allows users to create, distribute, and analyze surveys with AI-powered insights.

### Core Structure
- **Next.js App Router** - Uses the modern app directory structure
- **File-based Storage** - Surveys and responses stored as JSON files in `/data/` directory
- **Dashboard Layout** - Main interface uses a sidebar layout with dashboard pages
- **API Routes** - RESTful endpoints for survey operations and AI integration

### Key Directories
- `/src/app/` - Next.js app router pages and API routes
- `/src/app/(dashboard)/` - Dashboard pages with shared layout
- `/src/app/api/` - API endpoints for surveys, responses, and AI features
- `/src/components/` - Reusable React components
- `/data/` - JSON file storage for surveys, responses, and conversations

### Data Storage
- **Surveys**: Stored in `/data/surveys/[surveyId].json`
- **Responses**: Stored in `/data/responses/[surveyId].json`
- **Conversations**: Call transcripts in `/data/conversations/`
- **ID Generation**: Uses nanoid for unique survey IDs

### Key Features
- **AI Question Generation**: Uses Google Gemini API to generate survey questions
- **Call Integration**: Twilio integration for phone surveys
- **Email Notifications**: Nodemailer for survey distribution
- **Real-time Updates**: WebSocket support for live survey updates
- **Theme Support**: Dark/light mode with next-themes
- **Analytics**: Charts and visualizations with Recharts

### Component Architecture
- **Layout Components**: Header, Sidebar for dashboard structure
- **Form Components**: CreateSurveyForm for survey creation
- **Modal Components**: CallModal, ResultsModal, SendEmailModal
- **Dashboard Components**: StatCard, AnalyticsChart for data display

### API Endpoints
- `/api/surveys` - CRUD operations for surveys
- `/api/surveys/[surveyId]` - Individual survey operations
- `/api/surveys/[surveyId]/results` - Survey results and analytics
- `/api/generate-questions` - AI-powered question generation
- `/api/submit` - Survey response submission
- `/api/send-survey` - Email distribution
- `/api/calls/` - Phone survey integration

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **Responsive Design** - Mobile-first approach
- **Theme System** - Consistent dark/light mode support