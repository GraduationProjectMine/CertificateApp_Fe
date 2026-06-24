import React from "react";
import styles from "./CertificateCard.module.css";

export default function CertificateCard({ certificate }: { certificate: any }) {
  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <p className={styles._3}>{certificate.type}</p>
          <h3 className={styles._4}>{certificate.studentName}</h3>
        </div>
        <span className={`${styles._0} ${certificate.status === "Issued" ? "bg-green-50 text-green-600 border border-green-200" : certificate.status === "Revoked" ? "bg-red-50 text-danger border border-red-200" : "bg-amber-50 text-warning border border-amber-200"}`}>{certificate.status}</span>
      </div>
      <div className={styles._5}>
        <p><span className={styles._6}>Mã bằng:</span> {certificate.serialNumber}</p>
        <p><span className={styles._6}>Ngày cấp:</span> {certificate.issueDate}</p>
        {certificate.ipfsCid && <p className={styles._7}>IPFS: {certificate.ipfsCid}</p>}
      </div>
    </div>
  );
}
