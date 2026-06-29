import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.trim();
  const password = body?.password?.trim();
  const name = body?.name?.trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
  }

  return NextResponse.json({
    token: 'cacao-new-user-token',
    user: {
      email,
      name,
      role: 'student',
    },
  });
}
