import { certificateRepository } from "../repositories/certificate.repository";

export async function issueCertificate(data: any) {
  return certificateRepository.create(data);
}
