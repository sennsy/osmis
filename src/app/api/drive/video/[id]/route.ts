import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSession } from "../../../../../lib/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();
  
  const drive = google.drive({ version: "v3" });

  let authClient: any;
  if (session) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/callback`;
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expiry_date: session.expiry_date
    });
    authClient = oauth2Client;
  } else {
    // Fallback to API Key for public access
    authClient = process.env.GOOGLE_DRIVE_API_KEY;
  }

  try {
    const rangeHeader = request.headers.get("range");
    const driveHeaders: Record<string, string> = {};
    if (rangeHeader) {
      driveHeaders["Range"] = rangeHeader;
    }

    const response = await drive.files.get(
      { fileId: resolvedParams.id, alt: "media", auth: authClient },
      { responseType: "stream", headers: driveHeaders, validateStatus: (status) => status >= 200 && status < 300 }
    );

    // Node.js Readable stream to Web ReadableStream
    const stream = new ReadableStream({
      start(controller) {
        response.data.on("data", (chunk: any) => controller.enqueue(chunk));
        response.data.on("end", () => controller.close());
        response.data.on("error", (err: any) => controller.error(err));
      }
    });

    const responseHeaders = new Headers();
    if (response.headers["content-type"]) responseHeaders.set("Content-Type", response.headers["content-type"]);
    if (response.headers["content-length"]) responseHeaders.set("Content-Length", response.headers["content-length"]);
    if (response.headers["content-range"]) responseHeaders.set("Content-Range", response.headers["content-range"]);
    responseHeaders.set("Accept-Ranges", "bytes");

    return new NextResponse(stream, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Video proxy error:", error);
    return new NextResponse("Failed to stream video", { status: 500 });
  }
}
