import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('Simple OAuth callback - no PKCE');

    // Exchange authorization code for access token (without PKCE)
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
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Simple token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json();

    // Log success and store tokens temporarily
    console.log('Simple OAuth Success - Tokens received:', {
      access_token: tokens.access_token.substring(0, 20) + '...',
      instance_url: tokens.instance_url,
      refresh_token: tokens.refresh_token ? 'Present' : 'Not provided'
    });

    // Store tokens in environment variables temporarily (just for this session)
    // In production, you'd store in database or secure session
    process.env.SALESFORCE_ACCESS_TOKEN = tokens.access_token;
    process.env.SALESFORCE_INSTANCE_URL = tokens.instance_url;

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      instanceUrl: tokens.instance_url,
    });

  } catch (error) {
    console.error('Simple OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}