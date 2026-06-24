import React from "react";

export default function CertificateCard({ certificate }: { certificate: any }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold">{certificate.type}</p>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{certificate.studentName}</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${certificate.status === "Issued" ? "bg-green-50 text-green-600 border border-green-200" : certificate.status === "Revoked" ? "bg-red-50 text-danger border border-red-200" : "bg-amber-50 text-warning border border-amber-200"}`}>{certificate.status}</span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p><span className="font-semibold">Mã bằng:</span> {certificate.serialNumber}</p>
        <p><span className="font-semibold">Ngày cấp:</span> {certificate.issueDate}</p>
        {certificate.ipfsCid && <p className="font-mono text-xs text-primary truncate">IPFS: {certificate.ipfsCid}</p>}
      </div>
    </div>
  );
}
