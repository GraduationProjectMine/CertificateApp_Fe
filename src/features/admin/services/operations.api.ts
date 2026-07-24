import { request } from '@/lib/api';
import type { CreateCertificatePayload, CertificateDto } from '@/features/certificates/services/certificate.api';

export interface BatchItem {
  id: string;
  batchId: string;
  rowNumber: number;
  input: CreateCertificatePayload;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  error: string | null;
  certificateId: string | null;
}

export interface IssuanceBatch {
  id: string;
  name: string;
  status: 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  totalRows: number;
  successRows: number;
  failedRows: number;
  createdByName: string;
  createdAt: string;
  completedAt: string | null;
  items?: BatchItem[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLog {
  id: string;
  actorName: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  ipAddress: string | null;
  success: boolean;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface MonitorOverview {
  blockchain: {
    connected: boolean;
    network: string | null;
    chainId: number | null;
    blockNumber: number | null;
    contractAddress: string | null;
    walletAddress: string | null;
    walletBalance: string | null;
  };
  ipfs: { connected: boolean; gateway: string; error: string | null };
  totals: { transactions: number; cids: number; failedTransactions: number };
  transactions: Array<{
    timestamp: string | null;
    certificateId: string;
    certificateCode: string | null;
    action: 'ISSUE' | 'REVOKE';
    transactionHash: string | null;
    blockNumber: number | null;
    gasUsed: string | null;
    status: 'SUCCESS' | 'FAILED';
  }>;
  cids: Array<{
    certificateId: string;
    certificateCode: string | null;
    cid: string;
    createdAt: string;
  }>;
}

function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const operationsApi = {
  listBatches: () => request<IssuanceBatch[]>('/issuance-batches'),
  getBatch: (id: string) => request<IssuanceBatch>(`/issuance-batches/${id}`),
  createBatch: (name: string, rows: CreateCertificatePayload[], mode: 'DRAFT_ONLY' | 'FULL' = 'FULL') =>
    request<IssuanceBatch>('/issuance-batches', {
      method: 'POST',
      body: JSON.stringify({ name, rows, mode }),
    }),
  retryBatchItem: (batchId: string, itemId: string) =>
    request<IssuanceBatch>(`/issuance-batches/${batchId}/items/${itemId}/retry`, {
      method: 'POST',
    }),
  listRevoked: (page = 1, limit = 50) =>
    request<Paginated<CertificateDto>>(`/certificates/revoked?page=${page}&limit=${limit}`),
  revoke: (certificateId: string, reason: string) =>
    request<CertificateDto>(`/certificates/${certificateId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  retryRevocation: (certificateId: string) =>
    request<CertificateDto>(`/certificates/${certificateId}/retry-revoke`, {
      method: 'POST',
    }),
  auditLogs: (params: {
    page?: number;
    limit?: number;
    action?: string;
    actor?: string;
    search?: string;
  }) => request<Paginated<AuditLog>>(`/audit-logs${queryString(params)}`),
};
