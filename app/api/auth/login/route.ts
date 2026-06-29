import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.trim();
  const password = body?.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  return NextResponse.json({
    token: 'cacao-demo-token',
    user: {
      email,
      name: 'Cacao Learner',
      role: 'student',
    },
  });
}
