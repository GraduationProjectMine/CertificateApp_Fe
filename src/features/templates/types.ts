export interface TemplateField {
  id: string;
  type: 'text' | 'image' | 'qr' | 'line' | 'rect';
  x: number;
  y: number;
  w: number;
  h: number;
  font?: string;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  dynamic?: boolean;
  binding?: string;
  text?: string;
  label?: string;
  src?: string;
}

export interface PageSettings {
  width: number;
  height: number;
  bgColor: string;
  bgImage?: string;
}

export interface Decoration {
  type: 'border' | 'watermark';
  style?: string;
  color?: string;
  width?: number;
  offset?: number;
  text?: string;
  opacity?: number;
  font?: string;
  size?: number;
}

export interface DesignData {
  page: PageSettings;
  fields: TemplateField[];
  decorations: Decoration[];
}

export interface CertificateTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  design_data: DesignData;
  thumbnail_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
