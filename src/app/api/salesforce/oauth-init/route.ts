import { NextRequest, NextResponse } from 'next/server';

// Generate PKCE code verifier and challenge
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const consumerKey = process.env.SALESFORCE_CONSUMER_KEY;
    // Use your org-specific login URL for developer orgs
    const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://orgfarm-22f82d590b-dev-ed.develop.my.salesforce.com';
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/oauth/callback`;

    console.log('OAuth Init Debug:', {
      consumerKey: consumerKey ? consumerKey.substring(0, 10) + '...' : 'MISSING',
      loginUrl,
      redirectUri
    });

    if (!consumerKey) {
      return NextResponse.json(
        { error: 'Salesforce Consumer Key not configured' },
        { status: 400 }
      );
    }

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Create OAuth authorization URL with PKCE
    const authUrl = new URL(`${loginUrl}/services/oauth2/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', consumerKey);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'api refresh_token');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', codeVerifier); // Pass code verifier as state

    console.log('Generated OAuth URL with PKCE:', authUrl.toString());

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error) {
    console.error('OAuth init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }
}