import { ethers } from "ethers";

export async function issueCertificateOnChain(
  certificateHash: string,
  studentAddress: string
): Promise<string> {
  return "0x0000000000000000000000000000000000000000";
}

export async function revokeCertificateOnChain(
  certificateId: string
): Promise<string> {
  return "0x0000000000000000000000000000000000000000";
}

export async function verifyCertificateOnChain(
  certificateHash: string
): Promise<boolean> {
  return false;
}
