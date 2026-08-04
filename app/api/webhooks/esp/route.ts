import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // 1. AWS SES (SNS Webhook Format)
    if (payload.Type === 'Notification') {
      const message = JSON.parse(payload.Message || '{}');
      const notificationType = message.notificationType; // Bounce | Complaint

      if (notificationType === 'Bounce') {
        const bouncedRecipients = message.bounce?.bouncedRecipients || [];
        for (const recipient of bouncedRecipients) {
          const email = recipient.emailAddress;

          // Find email log by recipient email
          const logs = await prisma.emailLog.findMany({
            where: { recipientEmail: email },
            orderBy: { createdAt: 'desc' },
            take: 1,
          });

          if (logs.length > 0) {
            await prisma.emailLog.update({
              where: { id: logs[0].id },
              data: { status: 'BOUNCED', bouncedAt: new Date() },
            });

            await prisma.campaignStats.update({
              where: { campaignId: logs[0].campaignId },
              data: { bounceCount: { increment: 1 } },
            });
          }
        }
      } else if (notificationType === 'Complaint') {
        const complainedRecipients = message.complaint?.complainedRecipients || [];
        for (const recipient of complainedRecipients) {
          const email = recipient.emailAddress;

          const logs = await prisma.emailLog.findMany({
            where: { recipientEmail: email },
            orderBy: { createdAt: 'desc' },
            take: 1,
          });

          if (logs.length > 0) {
            await prisma.emailLog.update({
              where: { id: logs[0].id },
              data: { status: 'COMPLAINED' },
            });

            await prisma.campaignStats.update({
              where: { campaignId: logs[0].campaignId },
              data: { complaintCount: { increment: 1 } },
            });
          }
        }
      }
    }

    // 2. Custom Direct Webhook payload (e.g. for Webhook Testing / Simulation)
    if (payload.eventType && payload.logId) {
      const log = await prisma.emailLog.findUnique({
        where: { id: payload.logId },
      });

      if (log) {
        if (payload.eventType === 'BOUNCE') {
          await prisma.emailLog.update({
            where: { id: log.id },
            data: { status: 'BOUNCED', bouncedAt: new Date() },
          });
          await prisma.campaignStats.update({
            where: { campaignId: log.campaignId },
            data: { bounceCount: { increment: 1 } },
          });
        } else if (payload.eventType === 'COMPLAINT') {
          await prisma.emailLog.update({
            where: { id: log.id },
            data: { status: 'COMPLAINED' },
          });
          await prisma.campaignStats.update({
            where: { campaignId: log.campaignId },
            data: { complaintCount: { increment: 1 } },
          });
        }
      }
    }

    return NextResponse.json({ status: 'success', message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Error processing ESP webhook:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
