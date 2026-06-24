import { ethers } from "ethers";
import { getProvider } from "./provider";

export async function getWallet() {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    return await provider.getSigner();
  }
  return null;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const wallet = await getWallet();
    return wallet ? await wallet.getAddress() : null;
  } catch {
    return null;
  }
}
