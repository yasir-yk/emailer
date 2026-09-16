import nodemailer from 'nodemailer';

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  etherealUrl?: string | false;
  mode: 'smtp' | 'ethereal' | 'dev_inbox';
}

let cachedTestAccount: nodemailer.TestAccount | null = null;

async function getEtherealAccount() {
  if (!cachedTestAccount) {
    cachedTestAccount = await nodemailer.createTestAccount();
  }
  return cachedTestAccount;
}

/**
 * Extracts base64 image data URIs (e.g. data:image/png;base64,...) from HTML
 * and converts them into Nodemailer CID (Content-ID) inline attachments.
 * Gmail and Outlook block raw base64 data URIs, but render CID inline attachments seamlessly!
 */
export function extractCidAttachments(html: string): {
  processedHtml: string;
  attachments: Array<{ filename: string; content: Buffer; cid: string }>;
} {
  const attachments: Array<{ filename: string; content: Buffer; cid: string }> = [];
  let index = 0;

  const processedHtml = html.replace(
    /src=["'](data:image\/([a-zA-Z0-9]+);base64,([^"']+))["']/g,
    (_, fullDataUri, imageType, base64Data) => {
      index++;
      const ext = imageType === 'jpeg' ? 'jpg' : imageType;
      const cid = `inline_img_${Date.now()}_${index}`;
      const filename = `image_${index}.${ext}`;
      const buffer = Buffer.from(base64Data, 'base64');

      attachments.push({
        filename,
        content: buffer,
        cid,
      });

      return `src="cid:${cid}"`;
    }
  );

  return { processedHtml, attachments };
}

/**
 * Dispatches email using real SMTP if configured in .env,
 * otherwise creates an Ethereal test inbox message or logs to Dev Mailbox.
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, DEFAULT_FROM_EMAIL } = process.env;

  // Format and clean sender address
  let senderAddress = options.from.replace(/^"+|"+$/g, '').trim();
  const isPlaceholder = senderAddress.includes('userdomain.com') || senderAddress.includes('example.com');

  if (isPlaceholder && (DEFAULT_FROM_EMAIL || SMTP_USER)) {
    const defaultEmail = DEFAULT_FROM_EMAIL || SMTP_USER || 'info@mailtrap.co';
    senderAddress = `Emailer SaaS <${defaultEmail}>`;
  }

  // Ensure double quotes are not nested
  if (senderAddress.includes('"')) {
    senderAddress = senderAddress.replace(/"/g, '');
  }

  // Automatically convert base64 image data URIs into CID inline attachments for full Gmail / Client compatibility
  const { processedHtml, attachments } = extractCidAttachments(options.html);

  const isPlaceholderPass = !SMTP_PASS || SMTP_PASS === 'abcdefghijklmnop' || SMTP_PASS === 'your-smtp-pass';

  // 1. REAL SMTP DISPATCH (Mailtrap, Gmail, Resend, SendGrid, AWS SES)
  if (SMTP_HOST && SMTP_USER && SMTP_PASS && !isPlaceholderPass) {
    try {
      const cleanPass = SMTP_PASS.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: parseInt(SMTP_PORT || '587') === 465,
        auth: {
          user: SMTP_USER,
          pass: cleanPass,
        },
      });

      const info = await transporter.sendMail({
        from: senderAddress,
        to: options.to,
        subject: options.subject,
        html: processedHtml,
        headers: options.headers,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      return {
        success: true,
        messageId: info.messageId,
        mode: 'smtp',
      };
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Local Dev SMTP Fallback] Real SMTP auth failed (${err.message}). Falling back to local Dev Test Inbox.`);
      } else {
        if (err.code === 'EAUTH' || err.responseCode === 535) {
          throw new Error(
            'Gmail/SMTP Auth Failed (535): Credentials invalid. Make sure you are using your App Password or SMTP key.'
          );
        }
        if (err.responseCode === 550 || err.message?.includes('550 5.7.1')) {
          throw new Error(
            `SMTP Domain Error (550): Provider rejected "${senderAddress}". Check your verified sender address in .env (DEFAULT_FROM_EMAIL).`
          );
        }
        throw err;
      }
    }
  }

  // 2. AUTOMATIC ETHEREAL / DEV TEST MODE (Zero-config local testing with cached test account)
  try {
    const testAccount = await getEtherealAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: senderAddress,
      to: options.to,
      subject: options.subject,
      html: processedHtml,
      headers: options.headers,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    const etherealUrl = nodemailer.getTestMessageUrl(info);

    return {
      success: true,
      messageId: info.messageId,
      etherealUrl,
      mode: 'ethereal',
    };
  } catch {
    return {
      success: true,
      messageId: `dev-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mode: 'dev_inbox',
    };
  }
}
