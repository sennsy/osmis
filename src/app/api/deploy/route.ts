import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'GitHub Token belum diatur (GITHUB_TOKEN)' }, { status: 500 });
    }

    const repoOwner = 'sennsy'; 
    const repoName = 'osmis';
    const filePath = 'src/data/overrides.json';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    // 1. Get current file SHA
    let sha = '';
    const getRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'Osmis-CMS' }
    });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }

    // 2. Update file
    const contentEncoded = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');
    const updateRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Osmis-CMS'
      },
      body: JSON.stringify({
        message: 'feat(cms): auto-deploy data changes from backroom',
        content: contentEncoded,
        sha: sha || undefined
      })
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return NextResponse.json({ error: err.message }, { status: updateRes.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

