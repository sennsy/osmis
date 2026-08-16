import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'OAuth configuration missing in environment variables' }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to receive a refresh token
    scope: scopes,
    include_granted_scopes: true,
    prompt: 'consent' // Force to get refresh token every time for this demo
  });

  return NextResponse.redirect(authorizationUrl);
}
