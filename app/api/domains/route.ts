import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrgRole } from '@/lib/auth';
import { generateDomainRecords } from '@/lib/dns/dkim-spf';
import crypto from 'crypto';

export async function GET() {
  try {
    const { orgId } = await requireOrgRole('EDITOR');

    const domains = await prisma.sendingDomain.findMany({
      where: { organizationId: orgId },
      include: {
        dnsRecords: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ domains });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized or failed to fetch domains' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '');

    const existing = await prisma.sendingDomain.findFirst({
      where: { organizationId: orgId, domain: cleanDomain },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Domain is already registered for this organization.' },
        { status: 400 }
      );
    }

    const verificationToken = crypto.randomBytes(12).toString('hex');
    const generatedRecords = generateDomainRecords(cleanDomain, verificationToken);

    const newDomain = await prisma.sendingDomain.create({
      data: {
        organizationId: orgId,
        domain: cleanDomain,
        status: 'PENDING',
        verificationToken,
        dnsRecords: {
          create: generatedRecords.map((r) => ({
            recordType: r.recordType,
            host: r.host,
            value: r.value,
            description: r.description,
            status: 'PENDING',
          })),
        },
      },
      include: {
        dnsRecords: true,
      },
    });

    return NextResponse.json({ domain: newDomain }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sending domain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add sending domain' },
      { status: 500 }
    );
  }
}
