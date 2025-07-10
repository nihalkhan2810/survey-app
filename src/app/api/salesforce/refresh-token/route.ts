import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = process.env.SALESFORCE_REFRESH_TOKEN;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available. Please re-authenticate.' },
        { status: 400 }
      );
    }

    // Use the refresh token to get a new access token
    const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.SALESFORCE_CONSUMER_KEY!,
        client_secret: process.env.SALESFORCE_CONSUMER_SECRET!,
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { error: 'Token refresh failed. Please re-authenticate.' },
        { status: 401 }
      );
    }

    const tokens = await tokenResponse.json();

    // Update environment variables with new tokens
    process.env.SALESFORCE_ACCESS_TOKEN = tokens.access_token;
    process.env.SALESFORCE_INSTANCE_URL = tokens.instance_url;
    
    // Also update .env.local file for persistence
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update the access token
        if (envContent.includes('SALESFORCE_ACCESS_TOKEN=')) {
          envContent = envContent.replace(
            /SALESFORCE_ACCESS_TOKEN=.*/,
            `SALESFORCE_ACCESS_TOKEN=${tokens.access_token}`
          );
        } else {
          envContent += `\nSALESFORCE_ACCESS_TOKEN=${tokens.access_token}`;
        }
        
        // Update the instance URL
        if (envContent.includes('SALESFORCE_INSTANCE_URL=')) {
          envContent = envContent.replace(
            /SALESFORCE_INSTANCE_URL=.*/,
            `SALESFORCE_INSTANCE_URL=${tokens.instance_url}`
          );
        } else {
          envContent += `\nSALESFORCE_INSTANCE_URL=${tokens.instance_url}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env.local with refreshed Salesforce tokens');
      }
    } catch (error) {
      console.log('ℹ️  Could not update .env.local file:', error.message);
    }

    console.log('🔄 Successfully refreshed Salesforce tokens');

    return NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      instanceUrl: tokens.instance_url,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}