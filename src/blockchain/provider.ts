import { ethers } from "ethers";

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
}
