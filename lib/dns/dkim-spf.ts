export type DnsRecordType = 'TXT' | 'CNAME' | 'MX';

export interface GeneratedRecord {
  recordType: DnsRecordType;
  host: string;
  value: string;
  description: string;
}

export function generateDomainRecords(domain: string, verificationToken: string): GeneratedRecord[] {
  const cleanDomain = domain.toLowerCase().trim();

  return [
    {
      recordType: 'TXT',
      host: `_emailer-verify.${cleanDomain}`,
      value: `emailer-verification=${verificationToken}`,
      description: 'Domain Ownership Verification Record',
    },
    {
      recordType: 'TXT',
      host: cleanDomain,
      value: 'v=spf1 include:amazonses.com ~all',
      description: 'Sender Policy Framework (SPF) Authorization',
    },
    {
      recordType: 'CNAME',
      host: `res1._domainkey.${cleanDomain}`,
      value: 'res1.dkim.amazonses.com',
      description: 'DKIM Signature Public Key 1',
    },
    {
      recordType: 'CNAME',
      host: `res2._domainkey.${cleanDomain}`,
      value: 'res2.dkim.amazonses.com',
      description: 'DKIM Signature Public Key 2',
    },
    {
      recordType: 'TXT',
      host: `_dmarc.${cleanDomain}`,
      value: 'v=DMARC1; p=none; rua=mailto:dmarc@' + cleanDomain,
      description: 'DMARC Security & Alignment Policy',
    },
  ];
}
