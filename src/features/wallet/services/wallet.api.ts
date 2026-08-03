import { request } from "@/lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CertExportData {
  certificate: any;
  issuer: { organization_name: string; wallet_address?: string; logo_url?: string } | null;
}

export const walletApi = {
  getCertData: async (id: string): Promise<CertExportData> => {
    const res = await fetch(`${API_URL}/wallet/export/${id}/data`);
    if (!res.ok) throw new Error('Failed to fetch cert data');
    return res.json();
  },
  exportVC: (id: string) => {
    window.open(`${API_URL}/wallet/export/${id}/vc`, '_blank');
  },
  exportOpenBadges: (id: string) => {
    window.open(`${API_URL}/wallet/export/${id}/openbadges`, '_blank');
  },
};
