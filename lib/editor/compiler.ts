import { EmailBlock, EmailTemplate, DEFAULT_MERGE_TAGS, SocialLink } from './types';

export function getSocialDefaultIcon(platform: string): string {
  switch (platform) {
    case 'facebook':
      return 'https://cdn-icons-png.flaticon.com/512/733/733547.png';
    case 'twitter':
      return 'https://cdn-icons-png.flaticon.com/512/733/733579.png';
    case 'instagram':
      return 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png';
    case 'linkedin':
      return 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png';
    case 'youtube':
      return 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
    case 'website':
      return 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png';
    default:
      return 'https://cdn-icons-png.flaticon.com/512/841/841364.png';
  }
}

/**
 * Converts template blocks into clean MJML XML string
 */
export function compileToMJML(template: EmailTemplate): string {
  const { bodyBgColor, contentBgColor, blocks } = template;

  const mjmlBlocks = blocks
    .map((block) => {
      const s = block.styles;
      const p = block.properties;
      const pt = s.paddingTop ?? 10;
      const pb = s.paddingBottom ?? 10;
      const pl = s.paddingLeft ?? 25;
      const pr = s.paddingRight ?? 25;
      const align = s.textAlign || 'left';
      const color = s.color || '#333333';
      const fontSize = s.fontSize || '16px';
      const bg = s.backgroundColor ? `background-color="${s.backgroundColor}"` : '';

      switch (block.type) {
        case 'header':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column>
        <mj-text align="${align}" color="${color}" font-size="${fontSize}" font-family="${s.fontFamily || 'Helvetica, Arial, sans-serif'}" font-weight="bold">
          ${block.content}
        </mj-text>
      </mj-column>
    </mj-section>`;

        case 'text':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column>
        <mj-text align="${align}" color="${color}" font-size="${fontSize}" line-height="${s.lineHeight || '1.6'}" font-family="${s.fontFamily || 'Helvetica, Arial, sans-serif'}">
          ${block.content}
        </mj-text>
      </mj-column>
    </mj-section>`;

        case 'image':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column>
        <mj-image src="${p.imageUrl || 'https://via.placeholder.com/600x200'}" alt="${p.altText || ''}" href="${p.url || ''}" align="${align}" width="${s.width || '100%'}" border-radius="${s.borderRadius || 0}px" />
      </mj-column>
    </mj-section>`;

        case 'button':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column>
        <mj-button align="${align}" background-color="${s.backgroundColor || '#0284c7'}" color="${color}" font-size="${fontSize}" border-radius="${s.borderRadius || 6}px" href="${p.url || '#'}" font-weight="bold">
          ${block.content}
        </mj-button>
      </mj-column>
    </mj-section>`;

        case 'social':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column>
        <mj-social align="${align}" icon-size="28px" mode="horizontal">
          ${(p.socialLinks || [])
            .map((link) => `<mj-social-element name="${link.platform}" href="${link.url}" src="${link.iconUrl || getSocialDefaultIcon(link.platform)}" />`)
            .join('\n          ')}
        </mj-social>
      </mj-column>
    </mj-section>`;

        case 'divider':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column>
        <mj-divider border-width="${s.borderWidth || 1}px" border-style="${s.borderStyle || 'solid'}" border-color="${s.borderColor || '#e2e8f0'}" />
      </mj-column>
    </mj-section>`;

        case 'columns_2':
          return `
    <mj-section ${bg} padding="${pt}px ${pr}px ${pb}px ${pl}px">
      <mj-column width="50%" background-color="${p.column1Bg || 'transparent'}">
        <mj-text align="left" color="${color}" font-size="${fontSize}">
          ${p.column1Content || 'Column 1 Text'}
        </mj-text>
      </mj-column>
      <mj-column width="50%" background-color="${p.column2Bg || 'transparent'}">
        <mj-text align="left" color="${color}" font-size="${fontSize}">
          ${p.column2Content || 'Column 2 Text'}
        </mj-text>
      </mj-column>
    </mj-section>`;

        default:
          return '';
      }
    })
    .join('\n');

  return `<mjml>
  <mj-head>
    <mj-title>${template.subject || 'Newsletter'}</mj-title>
    <mj-preview>${template.preheader || ''}</mj-preview>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="${bodyBgColor || '#f8fafc'}" width="600px">
    <mj-wrapper background-color="${contentBgColor || '#ffffff'}">
${mjmlBlocks}
    </mj-wrapper>
  </mj-body>
</mjml>`;
}

/**
 * Converts template blocks into bulletproof inline-CSS HTML table structure
 */
export function compileToHTML(template: EmailTemplate): string {
  const { bodyBgColor, contentBgColor, blocks, subject, preheader } = template;

  const renderedBlocksHtml = blocks
    .map((block) => {
      const s = block.styles;
      const p = block.properties;
      const pt = s.paddingTop ?? 10;
      const pb = s.paddingBottom ?? 10;
      const pl = s.paddingLeft ?? 25;
      const pr = s.paddingRight ?? 25;
      const align = s.textAlign || 'left';
      const color = s.color || '#1e293b';
      const fontSize = s.fontSize || '16px';
      const bg = s.backgroundColor ? `background-color: ${s.backgroundColor};` : '';
      const font = s.fontFamily || 'Helvetica, Arial, sans-serif';

      switch (block.type) {
        case 'header':
          return `
          <!-- Header Block -->
          <tr>
            <td align="${align}" style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              <h1 style="margin: 0; font-family: ${font}; font-size: ${fontSize}; font-weight: 700; color: ${color}; text-align: ${align}; line-height: 1.3;">
                ${block.content}
              </h1>
            </td>
          </tr>`;

        case 'text':
          return `
          <!-- Text Block -->
          <tr>
            <td align="${align}" style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              <div style="font-family: ${font}; font-size: ${fontSize}; color: ${color}; line-height: ${s.lineHeight || '1.6'}; text-align: ${align};">
                ${block.content}
              </div>
            </td>
          </tr>`;

        case 'image': {
          const imgTag = `<img src="${p.imageUrl || 'https://via.placeholder.com/600x200'}" alt="${p.altText || ''}" width="100%" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; border-radius: ${s.borderRadius || 0}px;" />`;
          const imageElement = p.url ? `<a href="${p.url}" target="_blank" style="text-decoration: none;">${imgTag}</a>` : imgTag;
          return `
          <!-- Image Block -->
          <tr>
            <td align="${align}" style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              ${imageElement}
            </td>
          </tr>`;
        }

        case 'button':
          return `
          <!-- Button Block -->
          <tr>
            <td align="${align}" style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${p.url || '#'}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="${(s.borderRadius || 6) * 2}%" stroke="f" fillcolor="${s.backgroundColor || '#0284c7'}">
                <w:anchorlock/>
                <center style="color:${color};font-family:${font};font-size:${fontSize};font-weight:bold;">${block.content}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: ${align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0'};">
                <tr>
                  <td align="center" style="border-radius: ${s.borderRadius || 6}px; background-color: ${s.backgroundColor || '#0284c7'}; text-align: center;">
                    <a href="${p.url || '#'}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: ${font}; font-size: ${fontSize}; font-weight: 700; color: ${color}; text-decoration: none; border-radius: ${s.borderRadius || 6}px;">
                      ${block.content}
                    </a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>`;

        case 'social': {
          const links: SocialLink[] = p.socialLinks || [
            { platform: 'facebook', url: '#', iconUrl: getSocialDefaultIcon('facebook') },
            { platform: 'twitter', url: '#', iconUrl: getSocialDefaultIcon('twitter') },
            { platform: 'instagram', url: '#', iconUrl: getSocialDefaultIcon('instagram') },
          ];

          return `
          <!-- Social Block -->
          <tr>
            <td align="${align}" style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" style="margin: ${align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0'};">
                <tr>
                  ${links
                    .map((link) => {
                      const iconSrc = link.iconUrl || getSocialDefaultIcon(link.platform);
                      return `
                    <td style="padding: 0 10px;">
                      <a href="${link.url}" target="_blank" style="text-decoration: none;">
                        <img src="${iconSrc}" alt="${link.platform}" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
                      </a>
                    </td>`;
                    })
                    .join('')}
                </tr>
              </table>
            </td>
          </tr>`;
        }

        case 'divider':
          return `
          <!-- Divider Block -->
          <tr>
            <td style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              <hr style="border: 0; border-top: ${s.borderWidth || 1}px ${s.borderStyle || 'solid'} ${s.borderColor || '#e2e8f0'}; margin: 0;" />
            </td>
          </tr>`;

        case 'columns_2':
          return `
          <!-- 2-Column Block -->
          <tr>
            <td style="padding: ${pt}px ${pr}px ${pb}px ${pl}px; ${bg}">
              <!--[if mso]>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
              <td width="50%" valign="top">
              <![endif]-->
              <div style="display: inline-block; width: 100%; max-width: 275px; vertical-align: top; background-color: ${p.column1Bg || 'transparent'};">
                <div style="padding: 10px; font-family: ${font}; font-size: ${fontSize}; color: ${color};">
                  ${p.column1Content || 'Column 1 Content'}
                </div>
              </div>
              <!--[if mso]>
              </td>
              <td width="50%" valign="top">
              <![endif]-->
              <div style="display: inline-block; width: 100%; max-width: 275px; vertical-align: top; background-color: ${p.column2Bg || 'transparent'};">
                <div style="padding: 10px; font-family: ${font}; font-size: ${fontSize}; color: ${color};">
                  ${p.column2Content || 'Column 2 Content'}
                </div>
              </div>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>`;

        default:
          return '';
      }
    })
    .join('\n');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${subject || 'Newsletter'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; background-color: ${bodyBgColor || '#f8fafc'}; font-family: Helvetica, Arial, sans-serif; }
    table { border-spacing: 0; font-family: Helvetica, Arial, sans-serif; color: #333333; }
    td { padding: 0; }
    img { border: 0; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bodyBgColor || '#f8fafc'}; text-align: center;">
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">${preheader}</div>` : ''}
  <center style="width: 100%; table-layout: fixed; background-color: ${bodyBgColor || '#f8fafc'}; padding-top: 20px; padding-bottom: 40px;">
    <!--[if mso]>
    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;">
    <tr>
    <td align="center" valign="top">
    <![endif]-->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: ${contentBgColor || '#ffffff'}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      ${renderedBlocksHtml}
    </table>
    <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>`;
}

/**
 * Replaces merge tags in HTML with sample values for live preview mode
 */
export function substituteMergeTags(html: string, customValues: Record<string, string> = {}): string {
  let output = html;

  DEFAULT_MERGE_TAGS.forEach((tag) => {
    const val = customValues[tag.tag] || tag.sampleValue;
    output = output.replace(new RegExp(tag.tag.replace(/[{()}]/g, '\\$&'), 'g'), val);
  });

  return output;
}
