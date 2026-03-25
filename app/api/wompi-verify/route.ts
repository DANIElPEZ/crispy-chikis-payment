import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'Missing private key' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://sandbox.wompi.co/v1/transactions/${id}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
    });

    const data = await res.json();

    return NextResponse.json({ status: data.data?.status });
  } catch (err) {
    console.error('Error consultando Wompi:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}