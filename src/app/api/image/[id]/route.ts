import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return new NextResponse('Missing id parameter', { status: 400 });
  }

  // Use Google's high-speed image CDN (lh3.googleusercontent.com) which bypasses virus scan HTML pages
  const driveUrl = `https://lh3.googleusercontent.com/d/${id}=s1600`;
  
  try {
    let response = await fetch(driveUrl, { redirect: 'follow' });

    // Fallback to standard view URL if CDN returns non-ok status
    if (!response.ok) {
      const fallbackUrl = `https://drive.google.com/uc?export=view&id=${id}`;
      response = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow'
      });
    }

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Proxy image error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
