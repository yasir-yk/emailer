import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrgRole } from '@/lib/auth';
import { executeCampaignDispatch } from '@/lib/queue/dispatch-worker';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;
    const body = await req.json().catch(() => ({}));

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, organizationId: orgId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (body.scheduledAt) {
      const scheduledDate = new Date(body.scheduledAt);
      const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'SCHEDULED',
          scheduledAt: scheduledDate,
        },
      });
      return NextResponse.json({ message: 'Campaign scheduled successfully', campaign: updated });
    }

    // Immediate Queue Dispatch execution
    const result = await executeCampaignDispatch(campaignId);

    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { stats: true },
    });

    return NextResponse.json({
      message: 'Campaign dispatched successfully',
      campaign: updatedCampaign,
      dispatchResult: result,
    });
  } catch (error: any) {
    console.error('Error dispatching campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch campaign' },
      { status: 500 }
    );
  }
}
