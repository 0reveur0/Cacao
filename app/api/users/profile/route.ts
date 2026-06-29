import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const data = await request.json();
  if (!data || !data.name || !data.email) {
    return NextResponse.json({ error: 'Missing profile fields' }, { status: 400 });
  }

  return NextResponse.json({
    name: data.name,
    email: data.email,
    locale: data.locale ?? 'vi',
  });
}
