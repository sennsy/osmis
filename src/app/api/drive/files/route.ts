import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getSession } from '../../../../lib/session';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please connect your Google Drive first.' }, { status: 401 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'OAuth configuration missing in environment variables' }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expiry_date: session.expiry_date
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const searchParams = request.nextUrl.searchParams;
  const folderId = searchParams.get('folderId') || 'root';
  const query = searchParams.get('q');

  try {
    let q = `'${folderId}' in parents and trashed = false`;
    if (query) {
      q = query; // allow custom queries
    }

    const res = await drive.files.list({
      q: q,
      fields: 'files(id, name, mimeType, webViewLink, iconLink, thumbnailLink)',
      orderBy: 'folder, name',
      pageSize: 100
    });

    return NextResponse.json(res.data.files);
  } catch (error: any) {
    console.error('Google Drive API Error:', error);
    if (error.code === 401) {
      return NextResponse.json({ error: 'Token expired or invalid. Please login again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch files from Google Drive' }, { status: 500 });
  }
}
