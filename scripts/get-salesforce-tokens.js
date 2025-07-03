#!/usr/bin/env node

/**
 * Salesforce OAuth Token Generator
 * Run with: node scripts/get-salesforce-tokens.js
 */

const express = require('express');
const open = require('open');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Your Salesforce Connected App credentials
const CLIENT_ID = process.env.SALESFORCE_CONSUMER_KEY;
const CLIENT_SECRET = process.env.SALESFORCE_CONSUMER_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing Salesforce credentials in .env.local:');
  console.error('   SALESFORCE_CONSUMER_KEY:', CLIENT_ID ? '✅' : '❌');
  console.error('   SALESFORCE_CONSUMER_SECRET:', CLIENT_SECRET ? '✅' : '❌');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Salesforce OAuth</title></head>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1>🔐 Salesforce OAuth Token Generator</h1>
        <p>Click the button below to authorize with Salesforce:</p>
        <a href="/auth" style="display: inline-block; background: #0176d3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          🚀 Authorize with Salesforce
        </a>
        <br><br>
        <small>This will redirect you to Salesforce and then back here with your tokens.</small>
      </body>
    </html>
  `);
});

app.get('/auth', (req, res) => {
  const authUrl = `${LOGIN_URL}/services/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=api refresh_token`;
  
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    res.send(`<h1>❌ Error: ${error}</h1>`);
    return;
  }

  if (!code) {
    res.send('<h1>❌ No authorization code received</h1>');
    return;
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`${LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(`${tokens.error}: ${tokens.error_description}`);
    }

    // Display tokens
    res.send(`
      <html>
        <head><title>✅ Success!</title></head>
        <body style="font-family: Arial; padding: 40px;">
          <h1>✅ Success! Your Salesforce Tokens</h1>
          <p>Add these to your <code>.env.local</code> file:</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>📝 Copy these lines to .env.local:</h3>
            <pre style="background: white; padding: 15px; border-radius: 3px; overflow-x: auto;">
# MCP Salesforce Configuration
SALESFORCE_ACCESS_TOKEN=${tokens.access_token}
SALESFORCE_INSTANCE_URL=${tokens.instance_url}</pre>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>🔄 Refresh Token (for future use):</h4>
            <code style="word-break: break-all;">${tokens.refresh_token || 'Not provided'}</code>
          </div>

          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Copy the environment variables above to your .env.local</li>
            <li>Restart your development server</li>
            <li>Run: <code>node scripts/test-mcp-salesforce.js</code></li>
          </ol>

          <button onclick="window.close()">Close Window</button>
        </body>
      </html>
    `);

    // Also log to console
    console.log('\n✅ SUCCESS! Tokens obtained:');
    console.log('\n📝 Add these to your .env.local:');
    console.log('SALESFORCE_ACCESS_TOKEN=' + tokens.access_token);
    console.log('SALESFORCE_INSTANCE_URL=' + tokens.instance_url);
    if (tokens.refresh_token) {
      console.log('SALESFORCE_REFRESH_TOKEN=' + tokens.refresh_token);
    }
    console.log('\n🔄 You can now close this server (Ctrl+C)');

  } catch (error) {
    console.error('Token exchange failed:', error);
    res.send(`<h1>❌ Token exchange failed</h1><p>${error.message}</p>`);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 OAuth server running at: http://localhost:${PORT}`);
  console.log('🌐 Opening browser...\n');
  
  // Auto-open browser
  setTimeout(() => {
    open(`http://localhost:${PORT}`);
  }, 1000);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down OAuth server...');
  process.exit(0);
});