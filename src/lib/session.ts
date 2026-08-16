import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-for-local-dev-only-change-in-prod';
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Sessions last for 30 days
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function setSession(payload: SessionPayload) {
  const session = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set('osmis_admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('osmis_admin_session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('osmis_admin_session');
}
