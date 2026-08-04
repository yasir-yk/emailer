import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrgRole } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireOrgRole('EDITOR');
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, organizationId: orgId },
      include: {
        stats: true,
        contactList: {
          include: {
            contacts: true,
          },
        },
        emailLogs: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign detail' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    const { name, subject, senderName, senderEmail, recipientEmails, templateHtml, templateJson } = await req.json();

    const existing = await prisma.campaign.findFirst({
      where: { id: campaignId, organizationId: orgId },
      include: { contactList: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Process recipient emails if provided
    let listId = existing.contactListId;
    let newRecipientCount = 0;

    if (recipientEmails) {
      const emailArray = recipientEmails
        .split(/[,;\n]/)
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => e.length > 3 && e.includes('@'));

      if (emailArray.length > 0) {
        newRecipientCount = emailArray.length;
        if (listId) {
          // Replace contacts in list
          await prisma.contact.deleteMany({ where: { contactListId: listId } });
          await prisma.contact.createMany({
            data: emailArray.map((email: string) => ({
              contactListId: listId!,
              email,
              firstName: email.split('@')[0],
              status: 'SUBSCRIBED',
            })),
          });
        } else {
          // Create new list
          const newList = await prisma.contactList.create({
            data: {
              organizationId: orgId,
              name: `Audience for ${name || existing.name}`,
              contacts: {
                create: emailArray.map((email: string) => ({
                  email,
                  firstName: email.split('@')[0],
                  status: 'SUBSCRIBED',
                })),
              },
            },
          });
          listId = newList.id;
        }
      }
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name: name !== undefined ? name : existing.name,
        subject: subject !== undefined ? subject : existing.subject,
        senderName: senderName !== undefined ? senderName : existing.senderName,
        senderEmail: senderEmail !== undefined ? senderEmail : existing.senderEmail,
        contactListId: listId,
        templateHtml: templateHtml !== undefined ? templateHtml : existing.templateHtml,
        templateJson: templateJson !== undefined ? templateJson : existing.templateJson,
      },
      include: {
        stats: true,
        contactList: {
          include: {
            contacts: true,
          },
        },
      },
    });

    // Update total recipients in stats if new recipients were set
    if (newRecipientCount > 0 && updated.stats) {
      await prisma.campaignStats.update({
        where: { campaignId: updated.id },
        data: { totalRecipients: newRecipientCount },
      });
    }

    return NextResponse.json({ campaign: updated });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, organizationId: orgId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
