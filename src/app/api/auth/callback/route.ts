import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { setSession } from '../../../../lib/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/backroom?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'OAuth configuration missing in environment variables' }, { status: 500 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens in encrypted cookie
    await setSession({
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined
    });

    // Redirect back to Admin UI
    return NextResponse.redirect(new URL('/backroom?success=true', request.url));
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.redirect(new URL('/backroom?error=failed_to_exchange_token', request.url));
  }
}
