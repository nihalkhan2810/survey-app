#!/usr/bin/env node

/**
 * VAPI Integration Setup Script
 * 
 * This script helps set up and test VAPI voice integration
 * Run with: node scripts/setup-vapi.js
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecureSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  try {
    await fs.access(envPath);
    return envPath;
  } catch {
    const templatePath = path.join(process.cwd(), 'env.production.template');
    try {
      await fs.access(templatePath);
      console.log('📋 Creating .env.local from template...');
      const template = await fs.readFile(templatePath, 'utf8');
      await fs.writeFile(envPath, template);
      return envPath;
    } catch {
      console.log('❌ No environment file found. Please create .env.local first.');
      process.exit(1);
    }
  }
}

async function updateEnvFile(envPath, updates) {
  let content = await fs.readFile(envPath, 'utf8');
  
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (content.match(regex)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }
  
  await fs.writeFile(envPath, content);
}

async function testVapiConnection(apiKey) {
  console.log('🔍 Testing VAPI connection...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ VAPI connection successful!');
      return true;
    } else {
      console.log(`❌ VAPI connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ VAPI connection error: ${error.message}`);
    return false;
  }
}

async function testWebhookEndpoint(appUrl) {
  console.log('🔍 Testing webhook endpoint...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    const webhookUrl = `${appUrl}/api/calls/vapi/webhook`;
    const response = await fetch(webhookUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook endpoint accessible!');
      console.log(`📡 Webhook URL: ${webhookUrl}`);
      return true;
    } else {
      console.log(`❌ Webhook endpoint failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Webhook endpoint error: ${error.message}`);
    return false;
  }
}

async function setupVapi() {
  console.log('🚀 VAPI Integration Setup');
  console.log('=========================\n');
  
  const envPath = await checkEnvFile();
  const updates = {};
  
  // Step 1: VAPI API Key
  console.log('📋 Step 1: VAPI API Key');
  console.log('Get your API key from: https://dashboard.vapi.ai/api-keys\n');
  
  const apiKey = await question('Enter your VAPI API key: ');
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.log('❌ Invalid API key format. Should start with "sk-"');
    process.exit(1);
  }
  
  updates.VAPI_API_KEY = apiKey;
  
  // Test VAPI connection
  const connectionOk = await testVapiConnection(apiKey);
  if (!connectionOk) {
    console.log('❌ Cannot proceed with invalid API key');
    process.exit(1);
  }
  
  // Step 2: Webhook Secret
  console.log('\n📋 Step 2: Webhook Secret');
  console.log('This secret is used to verify webhook authenticity.\n');
  
  const useGenerated = await question('Generate a secure webhook secret? (y/n): ');
  if (useGenerated.toLowerCase() === 'y' || useGenerated.toLowerCase() === 'yes') {
    const secret = generateSecureSecret();
    updates.VAPI_WEBHOOK_SECRET = secret;
    console.log(`✅ Generated webhook secret: ${secret}`);
  } else {
    const secret = await question('Enter your webhook secret: ');
    if (!secret || secret.length < 16) {
      console.log('❌ Webhook secret should be at least 16 characters');
      process.exit(1);
    }
    updates.VAPI_WEBHOOK_SECRET = secret;
  }
  
  // Step 3: App URL
  console.log('\n📋 Step 3: Application URL');
  console.log('This is where VAPI will send webhooks.\n');
  
  const currentUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appUrl = await question(`Enter your app URL [${currentUrl}]: `) || currentUrl;
  
  if (!appUrl.startsWith('http')) {
    console.log('❌ App URL must start with http:// or https://');
    process.exit(1);
  }
  
  updates.NEXT_PUBLIC_APP_URL = appUrl;
  
  // Test webhook endpoint if not localhost
  if (!appUrl.includes('localhost')) {
    await testWebhookEndpoint(appUrl);
  } else {
    console.log('⚠️  Local development - webhook endpoint will be tested when deployed');
  }
  
  // Step 4: AI Model Selection
  console.log('\n📋 Step 4: AI Model Selection');
  console.log('Choose your preferred AI model for conversations:\n');
  console.log('1. OpenAI GPT-4o-mini (recommended, cost-effective)');
  console.log('2. Google Gemini (alternative)');
  console.log('3. Skip (use default)\n');
  
  const modelChoice = await question('Select option (1-3): ');
  
  if (modelChoice === '1') {
    const openaiKey = await question('Enter your OpenAI API key: ');
    if (openaiKey) {
      updates.OPENAI_API_KEY = openaiKey;
      console.log('✅ OpenAI configured');
    }
  } else if (modelChoice === '2') {
    const geminiKey = await question('Enter your Google Gemini API key: ');
    if (geminiKey) {
      updates.GEMINI_API_KEY = geminiKey;
      console.log('✅ Gemini configured');
    }
  }
  
  // Step 5: Update environment file
  console.log('\n📋 Step 5: Updating Environment File');
  await updateEnvFile(envPath, updates);
  console.log('✅ Environment file updated');
  
  // Step 6: Next Steps
  console.log('\n🎉 Setup Complete!');
  console.log('================\n');
  console.log('Next steps:');
  console.log('1. Configure webhooks in VAPI dashboard:');
  console.log(`   - Webhook URL: ${appUrl}/api/calls/vapi/webhook`);
  console.log(`   - Secret: ${updates.VAPI_WEBHOOK_SECRET}`);
  console.log('2. Test the integration by creating a survey and initiating a voice call');
  console.log('3. Monitor calls in the VAPI dashboard: https://dashboard.vapi.ai\n');
  
  if (appUrl.includes('localhost')) {
    console.log('⚠️  Development Mode:');
    console.log('   - Webhooks will not work on localhost');
    console.log('   - Deploy to a public URL for full functionality');
    console.log('   - Consider using ngrok for local testing\n');
  }
  
  console.log('📚 Documentation: See VAPI_VOICE_INTEGRATION.md for more details');
  
  rl.close();
}

async function configureWebhookInVapi() {
  console.log('\n🔧 VAPI Webhook Configuration Helper');
  console.log('===================================\n');
  
  const apiKey = await question('Enter your VAPI API key: ');
  const webhookUrl = await question('Enter your webhook URL: ');
  const secret = await question('Enter your webhook secret: ');
  
  console.log('\n📋 Configure in VAPI Dashboard:');
  console.log('1. Go to https://dashboard.vapi.ai');
  console.log('2. Navigate to Settings > Webhooks');
  console.log('3. Add webhook configuration:');
  console.log(`   - URL: ${webhookUrl}`);
  console.log(`   - Secret: ${secret}`);
  console.log('4. Enable relevant event types');
  
  console.log('\n💡 Alternative: Use VAPI API to configure webhooks programmatically');
  console.log('See documentation for API examples');
  
  rl.close();
}

async function main() {
  try {
    await setupVapi();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--webhook')) {
    configureWebhookInVapi();
  } else {
    main();
  }
} 