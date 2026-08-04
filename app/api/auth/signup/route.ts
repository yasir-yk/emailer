import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, password, orgName } = await req.json();

    if (!email || !password || !orgName) {
      return NextResponse.json(
        { error: 'Email, password, and organization name are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    // Auto-verify email in development or create verification token
    const isDev = process.env.NODE_ENV !== 'production';

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        emailVerified: isDev ? new Date() : null,
        memberships: {
          create: {
            role: 'OWNER',
            organization: {
              create: {
                name: orgName,
                slug,
              },
            },
          },
        },
      },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!isDev) {
      await prisma.verificationToken.create({
        data: {
          identifier: cleanEmail,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user: { id: user.id, email: user.email, name: user.name },
        organization: user.memberships[0]?.organization,
        token: isDev ? null : token,
        autoVerified: isDev,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Sign-up error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user account' },
      { status: 500 }
    );
  }
}
