import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return new NextResponse('Invalid protocol', { status: 400 });
    }

    const upstream = await fetch(parsed.toString(), {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return new NextResponse('Upstream image fetch failed', {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
