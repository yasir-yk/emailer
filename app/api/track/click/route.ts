import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logId = searchParams.get('logId');
  const targetUrl = searchParams.get('target');

  const destination = targetUrl ? decodeURIComponent(targetUrl) : '/';

  if (logId) {
    try {
      const emailLog = await prisma.emailLog.findUnique({
        where: { id: logId },
      });

      if (emailLog) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'CLICKED',
            clickedAt: new Date(),
          },
        });

        await prisma.campaignStats.update({
          where: { campaignId: emailLog.campaignId },
          data: {
            clickCount: { increment: 1 },
          },
        });
      }
    } catch (err) {
      console.error('Error tracking email click:', err);
    }
  }

  return NextResponse.redirect(destination);
}
