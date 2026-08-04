export interface BatchJobData {
  campaignId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  templateHtml: string;
  recipients: {
    contactId?: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }[];
}

export interface DispatchJobData {
  campaignId: string;
  contactId?: string;
  recipientEmail: string;
  firstName?: string;
  lastName?: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  templateHtml: string;
}

export const RATE_LIMIT_CONFIG = {
  maxEmailsPerSecond: 50,
  chunkSize: 1000,
  retryAttempts: 3,
  backoffDelayMs: 1000,
};
