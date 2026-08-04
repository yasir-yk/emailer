import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1x1 Transparent GIF Buffer
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logId = searchParams.get('logId');

  if (logId) {
    try {
      const emailLog = await prisma.emailLog.findUnique({
        where: { id: logId },
      });

      if (emailLog && !emailLog.openedAt) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'OPENED',
            openedAt: new Date(),
          },
        });

        await prisma.campaignStats.update({
          where: { campaignId: emailLog.campaignId },
          data: {
            openCount: { increment: 1 },
          },
        });
      }
    } catch (err) {
      console.error('Error tracking email open:', err);
    }
  }

  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
