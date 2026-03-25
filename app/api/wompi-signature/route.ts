import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { reference, amountInCents, currency } = await req.json();

  const integrationKey = process.env.INTEGRATION_KEY;

  if (!integrationKey) {
    return NextResponse.json({ error: 'Missing integration key' }, { status: 500 });
  }

  const concatenated = `${reference}${amountInCents}${currency}${integrationKey}`;

  const signature = crypto
    .createHash('sha256')
    .update(concatenated)
    .digest('hex');

  return NextResponse.json({ signature });
}