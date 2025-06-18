# Sayz Survey Platform - Setup Guide

## Overview
Sayz is a modern survey platform with AI-powered insights, role-based access control, and comprehensive analytics. This guide will help you set up the application for production use.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/sayz_db

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# API Keys
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Database Setup

#### Option A: PostgreSQL (Recommended)
1. Install PostgreSQL locally or use a cloud provider (Supabase, Railway, etc.)
2. Create a database named `sayz_db`
3. Update the `DATABASE_URL` in your `.env.local`

#### Option B: Supabase (Cloud)
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your connection string from Settings > Database
3. Update the `DATABASE_URL` in your `.env.local`

### 4. Database Migration & Seeding
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with demo accounts:
- **Admin**: admin@sayz.com (password: demo123)
- **User**: user@sayz.com (password: demo123)

## 🏗️ Production Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-app.vercel.app
GEMINI_API_KEY=your-api-key
```

## 📊 Features Implemented

### ✅ Core Features
- **Authentication System**: NextAuth with JWT sessions
- **Role-Based Access Control**: Admin, User, Moderator roles
- **Survey Management**: Create, edit, delete surveys with multiple question types
- **AI Question Generation**: Powered by Google Gemini API
- **Response Collection**: Anonymous and authenticated responses
- **Calendar Integration**: Survey scheduling and deadline management
- **Email Distribution**: Send surveys to target audiences
- **Theme System**: Light/dark mode with system preference
- **Admin Dashboard**: System analytics and user management

### ✅ Question Types Supported
- Text (Open-ended)
- Single Choice (Radio buttons)
- Multiple Choice (Checkboxes)
- Rating Scale (1-10 numeric rating)

### ✅ Database Schema
- **Users**: Authentication and role management
- **Surveys**: Survey metadata and settings
- **Questions**: Question content and configuration
- **Responses**: Anonymous and authenticated submissions
- **Answers**: Individual question responses
- **Reminders**: Scheduled email reminders

## 🔧 Configuration Options

### Survey Settings
- Start/end dates with automatic expiration
- Reminder scheduling (opening, midpoint, closing)
- Target audience selection
- Custom email templates

### Admin Features
- User management and role assignment
- System analytics and monitoring
- Survey oversight and moderation
- Email logs and delivery tracking

### Security Features
- Encrypted passwords (bcrypt)
- Protected API routes
- Role-based middleware
- CSRF protection via NextAuth

## 🎨 Customization

### Branding
Update the logo and colors in:
- `src/app/layout.tsx` (site title/description)
- `tailwind.config.ts` (color scheme)
- Components with gradient classes

### Email Templates
Modify email templates in:
- `src/app/api/generate-reminder/route.ts`
- `src/app/(dashboard)/surveys/send/page.tsx`

## 📈 Analytics & Monitoring

### Built-in Analytics
- User registration trends
- Survey creation metrics
- Response rate tracking
- System health monitoring

### Admin Dashboard
Access comprehensive analytics at `/admin`:
- Total users, surveys, responses
- Monthly growth metrics
- Active user tracking
- System performance indicators

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Database**: Use connection pooling for production
3. **Authentication**: Configure strong NEXTAUTH_SECRET
4. **API Keys**: Rotate keys regularly
5. **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL format
- Check database server status
- Ensure network connectivity

**Authentication Issues**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies/localStorage

**API Errors**
- Check GEMINI_API_KEY is valid
- Verify API quota limits
- Review server logs

### Development Tools
```bash
# View database in browser
npm run db:studio

# Reset database
npm run db:push --force-reset

# View logs
npm run dev
```

## 📚 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Framer Motion
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel (recommended)

## 🤝 Support

For issues or questions:
1. Check this setup guide
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Check [Prisma documentation](https://www.prisma.io/docs)
4. Review [NextAuth documentation](https://next-auth.js.org)

## 📝 License

This project is built for demonstration purposes. Modify and use as needed for your requirements.