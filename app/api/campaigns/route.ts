import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrgRole } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await requireOrgRole('EDITOR');

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: orgId },
      include: {
        stats: true,
        contactList: {
          include: {
            contacts: true,
          },
        },
        sendingDomain: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized or failed to fetch campaigns' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrgRole('ADMIN');
    const { name, subject, previewText, senderName, senderEmail, recipientEmails, templateHtml, templateJson } = await req.json();

    if (!name || !subject || !senderName || !senderEmail) {
      return NextResponse.json({ error: 'Name, subject, sender name, and sender email are required' }, { status: 400 });
    }

    // Parse recipient emails if provided
    let listId: string | null = null;
    let initialCount = 0;

    if (recipientEmails) {
      const emailArray = recipientEmails
        .split(/[,;\n]/)
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => e.length > 3 && e.includes('@'));

      if (emailArray.length > 0) {
        initialCount = emailArray.length;
        const newList = await prisma.contactList.create({
          data: {
            organizationId: orgId,
            name: `Audience for ${name}`,
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

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: orgId,
        name,
        subject,
        previewText,
        senderName,
        senderEmail,
        contactListId: listId,
        templateHtml: templateHtml || '<h1>Welcome to our Newsletter</h1>',
        templateJson: templateJson || null,
        status: 'DRAFT',
        stats: {
          create: {
            totalRecipients: initialCount,
            sentCount: 0,
            openCount: 0,
            clickCount: 0,
            bounceCount: 0,
          },
        },
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

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
