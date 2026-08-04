import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
    }

    const verificationRecord = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email.toLowerCase().trim(),
          token,
        },
      },
    });

    if (!verificationRecord || verificationRecord.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email.toLowerCase().trim(),
          token,
        },
      },
    });

    return NextResponse.json({ message: 'Email verified successfully. You can now sign in.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
