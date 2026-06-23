const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

export async function uploadToIPFS(data: Blob | File): Promise<string> {
  return "QmXoypizjW3WknFiJnKLwHCa7xW3mY8k3rQzP1V92aB7hC";
}

export async function fetchFromIPFS(cid: string): Promise<Blob | null> {
  return null;
}
