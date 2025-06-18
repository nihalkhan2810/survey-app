const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { 
  CreateTableCommand, 
  DescribeTableCommand, 
  PutItemCommand 
} = require('@aws-sdk/client-dynamodb')
const bcrypt = require('bcryptjs')
const { nanoid } = require('nanoid')

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  // AWS credentials are automatically provided in AWS environments
})

const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'sayz-users',
  SURVEYS: process.env.DYNAMODB_SURVEYS_TABLE || 'sayz-surveys',
  QUESTIONS: process.env.DYNAMODB_QUESTIONS_TABLE || 'sayz-questions',
  RESPONSES: process.env.DYNAMODB_RESPONSES_TABLE || 'sayz-responses',
  ANSWERS: process.env.DYNAMODB_ANSWERS_TABLE || 'sayz-answers',
  REMINDERS: process.env.DYNAMODB_REMINDERS_TABLE || 'sayz-reminders',
}

async function createTable(tableName, keySchema, attributeDefinitions) {
  try {
    // Check if table already exists
    const describeCommand = new DescribeTableCommand({ TableName: tableName })
    await client.send(describeCommand)
    console.log(`✓ Table ${tableName} already exists`)
    return
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error
    }
  }

  const createCommand = new CreateTableCommand({
    TableName: tableName,
    KeySchema: keySchema,
    AttributeDefinitions: attributeDefinitions,
    BillingMode: 'PAY_PER_REQUEST',
  })

  try {
    await client.send(createCommand)
    console.log(`✓ Created table: ${tableName}`)
  } catch (error) {
    console.error(`✗ Failed to create table ${tableName}:`, error.message)
    throw error
  }
}

async function setupTables() {
  console.log('Setting up DynamoDB tables...')

  // Users table
  await createTable(
    TABLES.USERS,
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  // Surveys table
  await createTable(
    TABLES.SURVEYS,
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  // Questions table
  await createTable(
    TABLES.QUESTIONS,
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  // Responses table
  await createTable(
    TABLES.RESPONSES,
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  // Answers table
  await createTable(
    TABLES.ANSWERS,
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  // Reminders table
  await createTable(
    TABLES.REMINDERS,
    [{ AttributeName: 'id', KeyType: 'HASH' }],
    [{ AttributeName: 'id', AttributeType: 'S' }]
  )

  console.log('All tables created successfully!')
}

async function seedData() {
  console.log('Seeding demo data...')

  // Create demo admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminId = nanoid()

  const adminUser = new PutItemCommand({
    TableName: TABLES.USERS,
    Item: {
      id: { S: adminId },
      email: { S: 'admin@sayz.com' },
      name: { S: 'Admin User' },
      password: { S: adminPassword },
      role: { S: 'ADMIN' },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
    },
  })

  // Create demo regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const userId = nanoid()

  const regularUser = new PutItemCommand({
    TableName: TABLES.USERS,
    Item: {
      id: { S: userId },
      email: { S: 'user@sayz.com' },
      name: { S: 'Demo User' },
      password: { S: userPassword },
      role: { S: 'USER' },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
    },
  })

  try {
    await client.send(adminUser)
    await client.send(regularUser)
    console.log('✓ Demo users created:')
    console.log('  - Admin: admin@sayz.com / admin123')
    console.log('  - User: user@sayz.com / user123')
  } catch (error) {
    console.error('✗ Failed to seed demo data:', error.message)
  }
}

async function main() {
  try {
    await setupTables()
    await seedData()
    console.log('\n🎉 DynamoDB setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Set your AWS credentials in environment variables')
    console.log('2. Deploy your application')
    console.log('3. Test login with demo accounts')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

main()