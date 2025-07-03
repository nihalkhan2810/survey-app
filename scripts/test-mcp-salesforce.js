#!/usr/bin/env node

/**
 * Test script for MCP Salesforce connection
 * Run with: node scripts/test-mcp-salesforce.js
 */

const { spawn } = require('child_process');
require('dotenv').config({ path: '.env.local' });

async function testMCPSalesforce() {
  console.log('🔍 Testing MCP Salesforce Connection...\n');

  // Check environment variables
  const accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

  if (!accessToken || !instanceUrl) {
    console.error('❌ Missing required environment variables:');
    console.error('   SALESFORCE_ACCESS_TOKEN:', accessToken ? '✅ Set' : '❌ Missing');
    console.error('   SALESFORCE_INSTANCE_URL:', instanceUrl ? '✅ Set' : '❌ Missing');
    console.error('\nPlease add these to your .env.local file');
    return;
  }

  console.log('✅ Environment variables configured:');
  console.log('   SALESFORCE_ACCESS_TOKEN:', accessToken.substring(0, 10) + '...');
  console.log('   SALESFORCE_INSTANCE_URL:', instanceUrl);
  console.log();

  // Test MCP server
  console.log('🚀 Starting MCP Salesforce server...');
  
  const mcpProcess = spawn('uvx', [
    '--from', 'mcp-salesforce-connector', 'salesforce'
  ], {
    env: {
      ...process.env,
      SALESFORCE_ACCESS_TOKEN: accessToken,
      SALESFORCE_INSTANCE_URL: instanceUrl
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let errorOutput = '';

  mcpProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 MCP Output:', data.toString().trim());
  });

  mcpProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('⚠️  MCP Error:', data.toString().trim());
  });

  mcpProcess.on('close', (code) => {
    console.log(`\n🏁 MCP process exited with code: ${code}`);
    
    if (code === 0) {
      console.log('✅ MCP Salesforce server appears to be working!');
    } else {
      console.log('❌ MCP Salesforce server encountered an error');
      console.log('Error output:', errorOutput);
    }
  });

  mcpProcess.on('error', (error) => {
    console.error('❌ Failed to start MCP process:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Install the connector: pip install mcp-salesforce-connector');
    console.log('2. Or install uvx: pip install uvx');
    console.log('3. Verify your Salesforce tokens are valid');
  });

  // Give it a few seconds to start up
  setTimeout(() => {
    console.log('\n⏹️  Stopping test...');
    mcpProcess.kill();
  }, 5000);
}

// Run the test
testMCPSalesforce().catch(console.error);