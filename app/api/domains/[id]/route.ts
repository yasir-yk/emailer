import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrgRole } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const resolvedParams = await params;
    const domainId = resolvedParams.id;

    const sendingDomain = await prisma.sendingDomain.findFirst({
      where: { id: domainId, organizationId: orgId },
    });

    if (!sendingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    await prisma.sendingDomain.delete({
      where: { id: domainId },
    });

    return NextResponse.json({ message: 'Domain removed successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete domain' },
      { status: 500 }
    );
  }
}
