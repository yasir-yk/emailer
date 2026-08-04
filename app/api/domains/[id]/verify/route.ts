import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrgRole } from '@/lib/auth';
import { verifyDomainRecords } from '@/lib/dns/verifier';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const resolvedParams = await params;
    const domainId = resolvedParams.id;

    const sendingDomain = await prisma.sendingDomain.findFirst({
      where: { id: domainId, organizationId: orgId },
      include: { dnsRecords: true },
    });

    if (!sendingDomain) {
      return NextResponse.json({ error: 'Sending domain not found' }, { status: 404 });
    }

    const verificationResult = await verifyDomainRecords(sendingDomain.dnsRecords);

    // Update each record status in DB
    for (const detail of verificationResult.details) {
      await prisma.dnsRecord.update({
        where: { id: detail.recordId },
        data: {
          status: detail.verified ? 'VERIFIED' : 'PENDING',
        },
      });
    }

    const spfVerified = verificationResult.details
      .filter((d) => d.host === sendingDomain.domain || d.expected.includes('v=spf1'))
      .every((d) => d.verified);

    const dkimVerified = verificationResult.details
      .filter((d) => d.host.includes('_domainkey'))
      .every((d) => d.verified);

    const dmarcVerified = verificationResult.details
      .filter((d) => d.host.includes('_dmarc'))
      .every((d) => d.verified);

    const updatedDomain = await prisma.sendingDomain.update({
      where: { id: domainId },
      data: {
        status: verificationResult.status,
        spfStatus: spfVerified ? 'VERIFIED' : 'PENDING',
        dkimStatus: dkimVerified ? 'VERIFIED' : 'PENDING',
        dmarcStatus: dmarcVerified ? 'VERIFIED' : 'PENDING',
      },
      include: {
        dnsRecords: true,
      },
    });

    return NextResponse.json({
      domain: updatedDomain,
      verificationResult,
    });
  } catch (error: any) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify sending domain' },
      { status: 500 }
    );
  }
}
