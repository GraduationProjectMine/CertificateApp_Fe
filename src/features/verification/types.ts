export interface VerificationResult {
  valid: boolean;
  certificate?: {
    id: string;
    studentName: string;
    type: string;
    major: string;
    issueDate: string;
    issuerName: string;
  };
  onChainData?: {
    txHash: string;
    blockNumber: number;
    timestamp: string;
  };
  error?: string;
}
