import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

const region = process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'us-east-1'
console.log('AWS Region:', region)
console.log('AWS Access Key ID:', 
  process.env.DYNAMODB_ACCESS_KEY_ID ? '***' + process.env.DYNAMODB_ACCESS_KEY_ID.slice(-4) :
  process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 
  'Not set'
)

const client = new DynamoDBClient({
  region: region,
  credentials: (process.env.DYNAMODB_ACCESS_KEY_ID && process.env.DYNAMODB_SECRET_ACCESS_KEY) ? {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY
  } : (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
})

const TABLES = {
  USERS: 'sayz-users',
  SURVEYS: 'sayz-surveys',
  QUESTIONS: 'sayz-questions',
  RESPONSES: 'sayz-responses',
  ANSWERS: 'sayz-answers',
  REMINDERS: 'sayz-reminders',
  API_CONFIGS: 'sayz-api-configs',
  RECIPIENTS: 'sayz-recipients',
}

async function createTable(tableName) {
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }))
    console.log(`✓ Table ${tableName} already exists`)
    return { exists: true, tableName }
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error
    }
  }

  // Create table
  console.log(`Creating table: ${tableName}...`)
  const createCommand = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  })

  await client.send(createCommand)
  console.log(`✓ Created table: ${tableName}`)
  return { created: true, tableName }
}

async function main() {
  try {
    console.log('🚀 Creating DynamoDB tables in AWS...\n')
    
    // Create all tables
    for (const [key, tableName] of Object.entries(TABLES)) {
      await createTable(tableName)
    }
    
    console.log('\n✅ All tables created successfully!')
    console.log('⏳ Waiting for tables to be ready...')
    
    // Wait for tables to be ready
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('\n📝 Creating demo users...')
    
    // Create demo users
    const adminPassword = await bcrypt.hash('admin123', 12)
    const userPassword = await bcrypt.hash('user123', 12)
    
    const adminUser = {
      TableName: TABLES.USERS,
      Item: {
        id: { S: nanoid() },
        email: { S: 'admin@sayz.com' },
        name: { S: 'Admin User' },
        password: { S: adminPassword },
        role: { S: 'ADMIN' },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
      },
    }
    
    const regularUser = {
      TableName: TABLES.USERS,
      Item: {
        id: { S: nanoid() },
        email: { S: 'user@sayz.com' },
        name: { S: 'Demo User' },
        password: { S: userPassword },
        role: { S: 'USER' },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
      },
    }
    
    await client.send(new PutItemCommand(adminUser))
    await client.send(new PutItemCommand(regularUser))
    
    console.log('✓ Demo users created:')
    console.log('  - Admin: admin@sayz.com / admin123')
    console.log('  - User: user@sayz.com / user123')
    
    console.log('\n🎉 Setup complete! You can now:')
    console.log('1. Go to AWS DynamoDB console to see your tables')
    console.log('2. Login with the demo accounts')
    console.log('3. Start using the application with real database!')
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.error('\nMake sure you have:')
    console.error('1. Set AWS_ACCESS_KEY_ID in .env.local')
    console.error('2. Set AWS_SECRET_ACCESS_KEY in .env.local')
    console.error('3. Set AWS_REGION in .env.local (default: us-east-1)')
    process.exit(1)
  }
}

main() 