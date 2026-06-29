import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    email: 'cacao.learner@example.com',
    name: 'Cacao Learner',
    locale: 'vi',
  });
}
