import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const res = await fetch(`https://production.wompi.co/v1/transactions/${id}`, {
    headers: { Authorization: `Bearer ${process.env.PRIVATE_KEY}` },
  });

  const data = await res.json();
  return NextResponse.json({ status: data.data?.status });
}