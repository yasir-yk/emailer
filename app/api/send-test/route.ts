import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/transport';
import { substituteMergeTags } from '@/lib/editor/compiler';

export async function POST(req: Request) {
  try {
    const {
      to,
      subject,
      html,
      senderName,
      senderEmail,
      sampleFirstName,
      sampleLastName,
      sampleOrgName,
      sampleAddress,
      sampleUnsubscribeUrl,
      sampleBrowserUrl,
    } = await req.json();

    if (!to || !html) {
      return NextResponse.json({ error: 'Recipient email and HTML content are required' }, { status: 400 });
    }

    const defaultEmail = process.env.DEFAULT_FROM_EMAIL || process.env.SMTP_USER || 'info@mailtrap.co';
    const effectiveSender = (senderEmail && !senderEmail.includes('userdomain.com')) ? senderEmail : defaultEmail;
    const from = `"${senderName || 'Emailer SaaS'}" <${effectiveSender}>`;

    // Process all user-provided or sample merge tags for test email
    const sampleTags: Record<string, string> = {
      '{{first_name}}': sampleFirstName || 'Alex',
      '{{last_name}}': sampleLastName || 'Smith',
      '{{email}}': to,
      '{{unsubscribe_url}}': sampleUnsubscribeUrl || 'https://example.com/unsubscribe',
      '{{view_in_browser_url}}': sampleBrowserUrl || 'https://example.com/view/123',
      '{{organization_name}}': sampleOrgName || 'Acme Marketing Inc',
      '{{company_address}}': sampleAddress || '123 Business St, Suite 100',
    };

    const processedHtml = substituteMergeTags(html, sampleTags);

    const result = await sendEmail({
      from,
      to,
      subject: subject || 'Test Email Preview',
      html: processedHtml,
    });

    return NextResponse.json({
      message: 'Test email dispatched successfully',
      mode: result.mode,
      messageId: result.messageId,
      etherealUrl: result.etherealUrl || null,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch test email' },
      { status: 500 }
    );
  }
}
