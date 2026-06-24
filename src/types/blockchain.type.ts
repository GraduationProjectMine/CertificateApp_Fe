export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  status: "Success" | "Pending" | "Failed";
  gasUsed?: string;
  function?: string;
}

export interface ContractInfo {
  address: string;
  network: string;
  abiVersion: string;
  deployer: string;
  deployedAt: string;
}
