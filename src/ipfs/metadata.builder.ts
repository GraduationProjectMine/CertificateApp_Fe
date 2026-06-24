export function buildMetadata(certificate: {
  id: string;
  studentName: string;
  type: string;
  major: string;
  issueDate: string;
  issuerName: string;
}) {
  return {
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: ["VerifiableCredential", "CertificateCredential"],
    issuer: { id: process.env.NEXT_PUBLIC_ISSUER_DID || "", name: certificate.issuerName },
    issuanceDate: certificate.issueDate,
    credentialSubject: {
      id: certificate.id,
      name: certificate.studentName,
      degree: { type: certificate.type, name: certificate.major },
    },
  };
}
