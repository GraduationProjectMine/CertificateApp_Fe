import { certificateRepository } from "../repositories/certificate.repository";

export async function revokeCertificate(id: string, reason: string) {
  return certificateRepository.update(id, { status: "Revoked", revokeReason: reason });
}
