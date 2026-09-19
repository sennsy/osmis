import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token || !zoneId) {
    return NextResponse.json(
      { error: 'Cloudflare credentials not configured' },
      { status: 500 }
    );
  }

  // Get data for the last 14 days
  const d = new Date();
  d.setDate(d.getDate() - 14);
  const sinceDate = d.toISOString().split('T')[0];

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        httpRequests1dGroups(
          limit: 14,
          filter: { date_geq: "${sinceDate}" },
          orderBy: [date_ASC]
        ) {
          dimensions {
            date
          }
          uniq {
            uniques
          }
          sum {
            requests
            pageViews
            bytes
            cachedBytes
          }
        }
      }
    }
  }`;

  try {
    const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    const result = await cfRes.json();

    if (result.errors && result.errors.length > 0) {
      console.error('Cloudflare GraphQL error:', result.errors);
      return NextResponse.json({ error: result.errors[0].message }, { status: 500 });
    }

    const groups = result.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];

    let totalRequests = 0;
    let totalPageViews = 0;
    let totalUniques = 0;
    let totalBytes = 0;
    let totalCachedBytes = 0;

    const dailyData = groups.map((g: any) => {
      const req = g.sum?.requests || 0;
      const pv = g.sum?.pageViews || 0;
      const unq = g.uniq?.uniques || 0;
      const bytes = g.sum?.bytes || 0;
      const cached = g.sum?.cachedBytes || 0;

      totalRequests += req;
      totalPageViews += pv;
      totalUniques += unq;
      totalBytes += bytes;
      totalCachedBytes += cached;

      // Format date label (e.g. "19 Sep")
      const dateObj = new Date(g.dimensions.date);
      const label = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      return {
        date: g.dimensions.date,
        label,
        requests: req,
        pageViews: pv,
        uniques: unq,
        bytes,
        cachedBytes: cached
      };
    });

    const cacheRate = totalBytes > 0 ? Math.round((totalCachedBytes / totalBytes) * 100) : 0;

    return NextResponse.json({
      success: true,
      hasData: groups.length > 0,
      totals: {
        requests: totalRequests,
        pageViews: totalPageViews,
        uniques: totalUniques,
        bandwidthBytes: totalBytes,
        cachedBytes: totalCachedBytes,
        cacheRate: `${cacheRate}%`
      },
      daily: dailyData
    });
  } catch (err: any) {
    console.error('Failed to fetch Cloudflare analytics:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
