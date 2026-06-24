export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  IPFS_GATEWAY: process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
  RPC_URL: process.env.RPC_URL || "http://localhost:8545",
};
