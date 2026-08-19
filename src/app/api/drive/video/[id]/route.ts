import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSession } from "../../../../../lib/session";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const response = await drive.files.get(
      { fileId: params.id, alt: "media", auth: authClient },
      { responseType: "stream" }
    );

    // Node.js Readable stream to Web ReadableStream
    const stream = new ReadableStream({
      start(controller) {
        response.data.on("data", (chunk: any) => controller.enqueue(chunk));
        response.data.on("end", () => controller.close());
        response.data.on("error", (err: any) => controller.error(err));
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": response.headers["content-type"] || "video/mp4",
        "Accept-Ranges": "bytes",
        "Content-Length": response.headers["content-length"] || "",
      }
    });
  } catch (error: any) {
    console.error("Video proxy error:", error);
    return new NextResponse("Failed to stream video", { status: 500 });
  }
}
