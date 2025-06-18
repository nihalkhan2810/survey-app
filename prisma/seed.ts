import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo admin user
  const adminPassword = await bcrypt.hash('demo123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sayz.com' },
    update: {},
    create: {
      email: 'admin@sayz.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create demo regular user
  const userPassword = await bcrypt.hash('demo123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@sayz.com' },
    update: {},
    create: {
      email: 'user@sayz.com',
      name: 'Demo User',
      password: userPassword,
      role: 'USER',
    },
  })

  // Create demo surveys
  const survey1 = await prisma.survey.create({
    data: {
      topic: 'Customer Satisfaction Survey',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: user.id,
      questions: {
        create: [
          {
            text: 'How satisfied are you with our service?',
            type: 'RATING',
            minValue: 1,
            maxValue: 5,
            order: 1,
          },
          {
            text: 'What is your age group?',
            type: 'SINGLE_CHOICE',
            options: ['18-25', '26-35', '36-45', '46-55', '55+'],
            order: 2,
          },
          {
            text: 'What improvements would you suggest?',
            type: 'TEXT',
            order: 3,
          },
        ],
      },
    },
  })

  const survey2 = await prisma.survey.create({
    data: {
      topic: 'Employee Feedback Survey',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
      createdBy: admin.id,
      questions: {
        create: [
          {
            text: 'How would you rate your work-life balance?',
            type: 'RATING',
            minValue: 1,
            maxValue: 10,
            order: 1,
          },
          {
            text: 'Which benefits are most important to you?',
            type: 'MULTIPLE_CHOICE',
            options: ['Health Insurance', 'Flexible Hours', 'Remote Work', 'Paid Time Off', 'Professional Development'],
            order: 2,
          },
          {
            text: 'What motivates you most at work?',
            type: 'TEXT',
            order: 3,
          },
        ],
      },
    },
  })

  // Create some demo responses
  const response1 = await prisma.response.create({
    data: {
      surveyId: survey1.id,
      userId: user.id,
      answers: {
        create: [
          {
            questionId: (await prisma.question.findFirst({ where: { surveyId: survey1.id, order: 1 } }))!.id,
            numberValue: 4,
          },
          {
            questionId: (await prisma.question.findFirst({ where: { surveyId: survey1.id, order: 2 } }))!.id,
            choiceValues: ['26-35'],
          },
          {
            questionId: (await prisma.question.findFirst({ where: { surveyId: survey1.id, order: 3 } }))!.id,
            textValue: 'Faster response times and better communication',
          },
        ],
      },
    },
  })

  console.log('✅ Seeding completed!')
  console.log('📧 Demo accounts created:')
  console.log('   Admin: admin@sayz.com (password: demo123)')
  console.log('   User: user@sayz.com (password: demo123)')
  console.log('📊 Demo surveys and responses created')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })