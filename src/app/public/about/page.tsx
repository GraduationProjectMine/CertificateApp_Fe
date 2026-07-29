"use client";
import React from "react";
import styles from "./page.module.css";

export default function ComparisonPage() {
  const comparisons = [
    { criteria: "Khả năng chỉnh sửa dữ liệu", traditional: "Có thể sửa trong DB", blockchain: "Dữ liệu hash on-chain không thể sửa" },
    { criteria: "Xác minh công khai", traditional: "Phụ thuộc nhà trường", blockchain: "Xác minh bằng public link/QR bất kỳ lúc nào" },
    { criteria: "Chống giả mạo", traditional: "Trung bình", blockchain: "Cao nhờ hash + chữ ký số + cơ chế đồng thuận" },
    { criteria: "Chi phí vận hành", traditional: "Chi phí server, DB, nhân sự", blockchain: "Gas fee + IPFS pinning (có thể tối ưu)" },
    { criteria: "Hiệu năng tra cứu", traditional: "Nhanh, truy vấn trực tiếp DB", blockchain: "Phụ thuộc network, có độ trễ nhất định" },
    { criteria: "Tính minh bạch", traditional: "Nội bộ, khó kiểm tra", blockchain: "Công khai, bất kỳ ai cũng có thể xác minh" },
    { criteria: "Khả năng thu hồi", traditional: "Dễ dàng cập nhật DB", blockchain: "Cần ghi trạng thái revoke lên contract" },
    { criteria: "Rủi ro bảo mật", traditional: "DB bị tấn công, sửa/xóa dữ liệu", blockchain: "Lộ private key, lỗi smart contract (có thể phòng tránh)" },
    { criteria: "Phục hồi dữ liệu", traditional: "Cần backup định kỳ", blockchain: "Dữ liệu phân tán, không phụ thuộc một điểm" },
    { criteria: "Tích hợp quốc tế", traditional: "Khó, thiếu chuẩn chung", blockchain: "Tuân theo chuẩn W3C Verifiable Credentials" },
  ];

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <h1 className={styles._3}>So sánh giải pháp</h1>
        <p className={styles._4}>
          Blockchain + IPFS so với Hệ thống lưu trữ văn bằng truyền thống
        </p>
      </div>

      <div className={styles._5}>
        <div className={styles._6}>
          <h2 className={styles._7}>Tại sao cần thay đổi?</h2>
          <p className={styles._8}>
            Hệ thống cấp phát văn bằng truyền thống phụ thuộc hoàn toàn vào cơ sở dữ liệu tập trung
            của nhà trường. Điều này dẫn đến nhiều rủi ro: dữ liệu có thể bị chỉnh sửa, khó xác minh
            độc lập, và quy trình kiểm tra thường chậm chạp, thiếu minh bạch.
          </p>
          <p className={styles._8}>
            Bằng cách ứng dụng blockchain và IPFS, văn bằng được số hóa, lưu trữ phi tập trung,
            và có thể xác minh công khai mà không cần thông qua bên trung gian.
          </p>
        </div>

        <div className={styles._9}>
          <h2 className={styles._10}>Bảng so sánh chi tiết</h2>
          <div className={styles._11}>
            <table className={styles._12}>
              <thead>
                <tr>
                  <th className={styles._13}>Tiêu chí</th>
                  <th className={styles._14}>Lưu trữ truyền thống</th>
                  <th className={styles._15}>Blockchain + IPFS</th>
                </tr>
              </thead>
              <tbody className={styles._16}>
                {comparisons.map((item, idx) => (
                  <tr key={idx} className={styles._17}>
                    <td className={styles._18}>{item.criteria}</td>
                    <td className={styles._19}>{item.traditional}</td>
                    <td className={styles._20}>{item.blockchain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles._21}>
          <h2 className={styles._22}>Ưu điểm của giải pháp blockchain</h2>
          <ul className={styles._23}>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Tính toàn vẹn:</strong> Hash văn bằng được ghi trên blockchain, không thể sửa đổi sau khi phát hành.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Xác minh công khai:</strong> Bất kỳ ai cũng có thể kiểm tra văn bằng qua mã số hoặc QR mà không cần tài khoản.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Minh bạch:</strong> Mọi giao dịch cấp và thu hồi đều được ghi nhận và có thể tra cứu.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Chống giả mạo:</strong> Kết hợp hash, chữ ký số và cơ chế đồng thuận blockchain, giảm thiểu tối đa rủi ro giả mạo.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Lưu trữ phi tập trung:</strong> IPFS đảm bảo file văn bằng luôn khả dụng mà không phụ thuộc vào một máy chủ duy nhất.</span>
            </li>
          </ul>
        </div>

        <div className={styles._26}>
          <h2 className={styles._27}>Hạn chế cần cân nhắc</h2>
          <ul className={styles._23}>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Chi phí gas:</strong> Mỗi giao dịch ghi blockchain đều tốn phí, đặc biệt khi cấp hàng loạt.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Hiệu năng:</strong> Giao dịch blockchain có độ trễ, không phù hợp cho xác minh thời gian thực với tần suất cao.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Bảo mật khóa:</strong> Nếu private key của tổ chức bị lộ, kẻ xấu có thể giả mạo quyền cấp bằng.</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Khả dụng IPFS:</strong> File trên IPFS cần được pinning để đảm bảo luôn có thể truy cập.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
