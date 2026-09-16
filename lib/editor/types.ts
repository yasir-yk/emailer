export type BlockType =
  | 'header'
  | 'text'
  | 'image'
  | 'button'
  | 'social'
  | 'divider'
  | 'columns_2';

export interface BlockStyles {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  width?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  lineHeight?: string;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'website' | 'custom';
  url: string;
  iconUrl?: string;
}

export interface BlockProperties {
  url?: string;
  altText?: string;
  imageUrl?: string;
  socialLinks?: SocialLink[];
  column1Content?: string;
  column2Content?: string;
  column1Bg?: string;
  column2Bg?: string;
}

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: string;
  styles: BlockStyles;
  properties: BlockProperties;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  senderName?: string;
  senderEmail?: string;
  bodyBgColor: string;
  contentBgColor: string;
  blocks: EmailBlock[];
  sampleValues?: Record<string, string>;
  updatedAt: string;
  contentPadding?: number;
  canvasZoom?: number;
}

export interface MergeTag {
  label: string;
  tag: string;
  category: 'User' | 'System' | 'Organization';
  sampleValue: string;
}

export const DEFAULT_MERGE_TAGS: MergeTag[] = [
  { label: 'First Name', tag: '{{first_name}}', category: 'User', sampleValue: 'Alex' },
  { label: 'Last Name', tag: '{{last_name}}', category: 'User', sampleValue: 'Smith' },
  { label: 'Email Address', tag: '{{email}}', category: 'User', sampleValue: 'alex@example.com' },
  { label: 'Unsubscribe Link', tag: '{{unsubscribe_url}}', category: 'System', sampleValue: 'https://example.com/unsubscribe' },
  { label: 'View in Browser', tag: '{{view_in_browser_url}}', category: 'System', sampleValue: 'https://example.com/view/123' },
  { label: 'Organization Name', tag: '{{organization_name}}', category: 'Organization', sampleValue: 'Acme Marketing Inc' },
  { label: 'Company Address', tag: '{{company_address}}', category: 'Organization', sampleValue: '123 Business St, Suite 100' },
];
