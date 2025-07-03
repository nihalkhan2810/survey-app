import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    if (!codeVerifier) {
      return NextResponse.json(
        { error: 'Code verifier is required for PKCE' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token with PKCE
    // Always use login.salesforce.com for token exchange (standard practice)
    const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SALESFORCE_CONSUMER_KEY!,
        client_secret: process.env.SALESFORCE_CONSUMER_SECRET!,
        redirect_uri: 'http://localhost:3000/oauth/callback',
        code: code,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        requestBody: {
          grant_type: 'authorization_code',
          client_id: process.env.SALESFORCE_CONSUMER_KEY?.substring(0, 10) + '...',
          redirect_uri: 'http://localhost:3000/oauth/callback',
          code: code.substring(0, 10) + '...',
          code_verifier: codeVerifier.substring(0, 10) + '...'
        }
      });
      throw new Error(`Token exchange failed: ${tokenResponse.statusText} - ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    // Log success and store tokens temporarily
    console.log('OAuth Success - Tokens received:', {
      access_token: tokens.access_token.substring(0, 20) + '...',
      instance_url: tokens.instance_url,
      refresh_token: tokens.refresh_token ? 'Present' : 'Not provided'
    });

    // Store tokens in environment variables temporarily (just for this session)
    // In production, you'd store in database or secure session
    process.env.SALESFORCE_ACCESS_TOKEN = tokens.access_token;
    process.env.SALESFORCE_INSTANCE_URL = tokens.instance_url;

    // Also try to update the .env.local file for persistence
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update or add the access token
        if (envContent.includes('SALESFORCE_ACCESS_TOKEN=')) {
          envContent = envContent.replace(
            /SALESFORCE_ACCESS_TOKEN=.*/,
            `SALESFORCE_ACCESS_TOKEN=${tokens.access_token}`
          );
        } else {
          envContent += `\nSALESFORCE_ACCESS_TOKEN=${tokens.access_token}`;
        }
        
        // Update or add the instance URL
        if (envContent.includes('SALESFORCE_INSTANCE_URL=')) {
          envContent = envContent.replace(
            /SALESFORCE_INSTANCE_URL=.*/,
            `SALESFORCE_INSTANCE_URL=${tokens.instance_url}`
          );
        } else {
          envContent += `\nSALESFORCE_INSTANCE_URL=${tokens.instance_url}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env.local with new Salesforce tokens');
      }
    } catch (error) {
      console.log('ℹ️  Could not update .env.local file:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      instanceUrl: tokens.instance_url,
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}