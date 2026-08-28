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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/callback`;

  if (!clientId || !clientSecret) {
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

    let allFiles: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const res: any = await drive.files.list({
        q: q,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, thumbnailLink)',
        orderBy: 'folder, name',
        pageSize: 1000,
        pageToken: pageToken
      });

      if (res.data.files && res.data.files.length > 0) {
        allFiles = allFiles.concat(res.data.files);
      }
      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);

    return NextResponse.json(allFiles);
  } catch (error: any) {
    console.error('Google Drive API Error:', error);
    if (error.code === 401) {
      return NextResponse.json({ error: 'Token expired or invalid. Please login again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch files from Google Drive' }, { status: 500 });
  }
}
