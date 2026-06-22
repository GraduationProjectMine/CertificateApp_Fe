"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateCredentialWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 State: Student Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const students = [
    { id: "1", code: "20202345", name: "Nguyễn Văn Hùng", email: "hung.nv202345@sis.hust.edu.vn", major: "Khoa học máy tính" },
    { id: "2", code: "20201192", name: "Lê Thị Thu", email: "thu.lt201192@sis.hust.edu.vn", major: "Kỹ thuật máy tính" },
    { id: "3", code: "20203498", name: "Phạm Hoàng Minh", email: "minh.ph203498@sis.hust.edu.vn", major: "Công nghệ thông tin" }
  ];
  
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.includes(searchQuery)
  );

  // Step 2 State: Credential Info Form
  const [formData, setFormData] = useState({
    certName: "BẰNG CỬ NHÂN KỸ THUẬT",
    major: "KHOA HỌC MÁY TÍNH",
    classification: "Xuất sắc",
    gpa: "3.82",
    serialNumber: "HUST-2026-9562",
    registryNumber: "SVS-2026/047",
    issueDate: "2026-06-22",
    signer: "GS. TS. Huỳnh Quyết Thắng"
  });

  // Step 3 State: Template selection
  const [selectedTemplate, setSelectedTemplate] = useState("temp-1");
  const templates = [
    { id: "temp-1", name: "Mẫu bằng ĐH Bách Khoa (Mặc định)", thumb: "bg-teal-900/10 border-primary" },
    { id: "temp-2", name: "Mẫu chứng chỉ tiếng Anh liên kết", thumb: "bg-blue-900/10 border-blue-200" },
    { id: "temp-3", name: "Mẫu bằng Thạc sĩ công nghệ", thumb: "bg-slate-900/10 border-slate-300" }
  ];

  // Step 4 State: Cryptographic signing and IPFS status
  const [ipfsStatus, setIpfsStatus] = useState("idle"); // idle, processing, success
  const [ipfsCid, setIpfsCid] = useState("");
  const [pdfHash, setPdfHash] = useState("");

  const runIpfsFlow = () => {
    setIpfsStatus("processing");
    setTimeout(() => {
      setIpfsStatus("success");
      setIpfsCid("QmXoypizjW3WknFiJnKLwHCa7xW3mY8k3rQzP1V92aB7hC");
      setPdfHash("0x8e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85");
    }, 2000);
  };

  // Step 5 State: Blockchain submission status
  const [blockchainStatus, setBlockchainStatus] = useState("idle"); // idle, processing, success
  const [txHash, setTxHash] = useState("");

  const runBlockchainFlow = () => {
    setBlockchainStatus("processing");
    setTimeout(() => {
      setBlockchainStatus("success");
      setTxHash("0x71c7656ec7ab88b098defb751b7401b5f6d8976fd9c381c19b4e872e499cf9b");
    }, 2500);
  };

  const stepsList = [
    { step: 1, name: "Chọn sinh viên" },
    { step: 2, name: "Thông tin văn bằng" },
    { step: 3, name: "Mẫu bằng & Preview" },
    { step: 4, name: "Ký số & IPFS" },
    { step: 5, name: "Ghi Blockchain" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cấp phát văn bằng mới</h1>
        <p className="text-xs text-gray-500 mt-1">Quy trình cấp bằng động vĩnh viễn lưu trữ trên IPFS và định danh mật mã hóa trên blockchain.</p>
      </div>

      {/* Progress Wizard Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 -z-10"></div>
          <div 
            className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          ></div>

          {stepsList.map((s) => (
            <button
              key={s.step}
              disabled={s.step > currentStep && !selectedStudent}
              onClick={() => setCurrentStep(s.step)}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                  s.step < currentStep
                    ? "bg-primary border-primary text-white"
                    : s.step === currentStep
                    ? "bg-white dark:bg-gray-900 border-primary text-primary ring-4 ring-primary/10"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                }`}
              >
                {s.step < currentStep ? "✓" : s.step}
              </div>
              <span 
                className={`hidden md:block text-[10px] font-bold uppercase tracking-wider ${
                  s.step === currentStep ? "text-primary" : "text-gray-400"
                }`}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[380px] flex flex-col justify-between">
        
        {/* STEP 1 CONTENT: SELECT STUDENT */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Bước 1: Chọn sinh viên nhận bằng</h2>
              <p className="text-xs text-gray-500">Tìm kiếm và chọn một sinh viên trong danh sách hồ sơ học tập để tiến hành cấp bằng.</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên bằng họ tên hoặc mã số..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="border border-gray-150 dark:border-gray-850 rounded-2xl overflow-hidden divide-y divide-gray-150 dark:divide-gray-850 max-h-48 overflow-y-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`p-3 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                        selectedStudent?.id === s.id
                          ? "bg-primary/5 dark:bg-teal-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-gray-800/20"
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-gray-900 dark:text-white">{s.name} ({s.code})</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-medium">{s.major}</span>
                        <input
                          type="radio"
                          checked={selectedStudent?.id === s.id}
                          onChange={() => {}}
                          className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">Không tìm thấy sinh viên nào khớp kết quả tìm kiếm.</div>
                )}
              </div>

              {selectedStudent && (
                <div className="bg-slate-50 dark:bg-gray-850 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 text-xs space-y-2">
                  <div className="font-bold text-primary mb-1 uppercase tracking-wider">Thông tin sinh viên đã chọn:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-gray-400">Họ và tên:</span>
                      <span className="block font-bold text-gray-800 dark:text-gray-200">{selectedStudent.name}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Mã sinh viên:</span>
                      <span className="block font-bold text-gray-800 dark:text-gray-200">{selectedStudent.code}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Ngành học:</span>
                      <span className="block font-bold text-gray-800 dark:text-gray-200">{selectedStudent.major}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Hòm thư:</span>
                      <span className="block font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 CONTENT: ENTER CREDENTIAL DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Bước 2: Khai báo thông tin văn bằng</h2>
              <p className="text-xs text-gray-500">Nhập các thuộc tính nghiệp vụ chính của chứng chỉ số tốt nghiệp.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tên văn bằng</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.certName}
                  onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Ngành học</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Xếp loại tốt nghiệp</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.classification}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                >
                  <option>Xuất sắc</option>
                  <option>Giỏi</option>
                  <option>Khá</option>
                  <option>Trung bình</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Điểm học tập (GPA)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Số hiệu văn bằng</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Số vào sổ quyết định</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.registryNumber}
                  onChange={(e) => setFormData({ ...formData, registryNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Ngày cấp bằng</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Người ký quyết định</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  value={formData.signer}
                  onChange={(e) => setFormData({ ...formData, signer: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 CONTENT: TEMPLATE SELECTOR AND DIGITAL PREVIEW */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Bước 3: Chọn mẫu văn bằng & Preview</h2>
              <p className="text-xs text-gray-500">Xem trước văn bằng thực tế hiển thị động để đảm bảo hình thức thẩm mỹ.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left templates list */}
              <div className="md:col-span-4 space-y-3">
                <span className="block text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wide">Mẫu giao diện</span>
                {templates.map((temp) => (
                  <button
                    key={temp.id}
                    onClick={() => setSelectedTemplate(temp.id)}
                    className={`w-full p-4 rounded-xl text-left border text-xs font-semibold transition-all ${
                      selectedTemplate === temp.id
                        ? "bg-primary/5 border-primary ring-2 ring-primary/10"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-850 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {temp.name}
                  </button>
                ))}
              </div>

              {/* Right Certificate Preview Card */}
              <div className="md:col-span-8 bg-slate-50 dark:bg-gray-850 p-4 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl flex justify-center">
                <div className="w-full max-w-[420px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
                  
                  <div className="text-center space-y-1 mb-5">
                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">ĐẠI HỌC BÁCH KHOA HÀ NỘI</span>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">BẰNG CỬ NHÂN</h3>
                  </div>

                  <div className="space-y-4 text-xs text-center">
                    <div className="py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-gray-150 dark:border-gray-800 rounded-xl">
                      <span className="block text-[8px] text-gray-450 uppercase tracking-wider font-semibold">Cấp cho sinh viên</span>
                      <span className="block text-sm font-extrabold text-gray-800 dark:text-white mt-0.5">{selectedStudent?.name || "Nguyễn Văn Hùng"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left px-2">
                      <div>
                        <span className="block text-[8px] text-gray-450 uppercase">Chuyên ngành</span>
                        <span className="block font-bold text-[11px] text-gray-700 dark:text-gray-300">{formData.major}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-450 uppercase">Xếp loại</span>
                        <span className="block font-bold text-[11px] text-gray-700 dark:text-gray-300">{formData.classification} (GPA {formData.gpa})</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-450 uppercase">Số hiệu</span>
                        <span className="block font-mono text-[10px] text-gray-700 dark:text-gray-350">{formData.serialNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-450 uppercase">Người ký</span>
                        <span className="block font-bold text-[10px] text-gray-700 dark:text-gray-300 truncate" title={formData.signer}>{formData.signer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[9px] text-gray-400">
                    <div>
                      <span>Số vào sổ: </span>
                      <span className="font-mono text-gray-600 dark:text-gray-400">{formData.registryNumber}</span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 p-0.5 rounded border border-gray-200/50">
                      {/* Fake QR representation */}
                      <div className="w-full h-full border border-dashed border-gray-300 flex items-center justify-center font-bold text-[7px] text-gray-400 uppercase select-none">QR Code</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 CONTENT: SIGNING & UPLOAD TO IPFS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Bước 4: Ký số & Upload tệp lên IPFS</h2>
              <p className="text-xs text-gray-500">Tạo tệp PDF văn bằng, mã hóa hash SHA-256 của văn bằng và ký số số hóa trước khi lưu phi tập trung.</p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 dark:bg-gray-850 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-6 text-xs space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Trạng thái tệp:</span>
                  {ipfsStatus === "idle" && <span className="text-gray-450 font-bold">Chưa xử lý</span>}
                  {ipfsStatus === "processing" && <span className="text-primary font-bold animate-pulse">Đang tải lên IPFS...</span>}
                  {ipfsStatus === "success" && <span className="text-green-500 font-bold">✓ Hoàn tất</span>}
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-primary transition-all duration-1000 ${
                      ipfsStatus === "idle" ? "w-0" : ipfsStatus === "processing" ? "w-1/2" : "w-full"
                    }`}
                  ></div>
                </div>
              </div>

              {ipfsStatus === "success" && (
                <div className="space-y-3.5 border-t border-gray-200/60 dark:border-gray-800/60 pt-4">
                  <div>
                    <span className="block text-gray-400 uppercase text-[9px] font-bold">Mã định danh IPFS CID:</span>
                    <span className="block font-mono text-xs text-primary dark:text-teal-400 break-all select-all">{ipfsCid}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase text-[9px] font-bold">Mã băm SHA-256 PDF:</span>
                    <span className="block font-mono text-xs text-gray-700 dark:text-gray-300 break-all select-all">{pdfHash}</span>
                  </div>
                </div>
              )}

              {ipfsStatus !== "processing" && (
                <button
                  type="button"
                  onClick={runIpfsFlow}
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all active:scale-[0.98] select-none"
                >
                  {ipfsStatus === "success" ? "Tạo & Ký số lại" : "Tiến hành Ký số & Upload IPFS"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5 CONTENT: WRITE TO BLOCKCHAIN */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Bước 5: Ghi nhận giao dịch Blockchain</h2>
              <p className="text-xs text-gray-500">Khóa thông tin mã hash/IPFS CID vĩnh viễn lên mạng lưới blockchain thông qua Smart Contract.</p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 dark:bg-gray-850 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-6 text-xs space-y-5">
              <div className="space-y-3 text-slate-700 dark:text-slate-350">
                <div className="flex justify-between">
                  <span>Mạng blockchain:</span>
                  <span className="font-bold text-gray-900 dark:text-white">Sepolia Ethereum Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span>Đơn vị phát hành:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formData.signer}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mã băm ghi nhận:</span>
                  <span className="font-mono text-primary dark:text-teal-400 truncate w-40" title={pdfHash || "Chưa có"}>
                    {pdfHash || "Hãy hoàn thành Bước 4"}
                  </span>
                </div>
              </div>

              {blockchainStatus === "processing" && (
                <div className="text-center py-4 space-y-3">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="block text-[11px] text-gray-500 animate-pulse">Đang gửi giao dịch Smart Contract, vui lòng ký xác nhận ví MetaMask...</span>
                </div>
              )}

              {blockchainStatus === "success" && (
                <div className="space-y-3.5 border-t border-gray-200/60 dark:border-gray-800/60 pt-4 bg-green-500/5 p-3 rounded-2xl border border-green-500/10">
                  <div className="text-green-500 font-bold flex items-center gap-1.5 text-xs">
                    <span>✓ Cấp phát văn bằng On-chain thành công!</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase text-[9px] font-bold">Transaction Hash:</span>
                    <span className="block font-mono text-[10.5px] text-secondary dark:text-blue-400 break-all select-all">{txHash}</span>
                  </div>
                </div>
              )}

              {blockchainStatus !== "processing" && (
                <button
                  type="button"
                  disabled={!pdfHash}
                  onClick={blockchainStatus === "success" ? () => router.push("/admin/credentials") : runBlockchainFlow}
                  className={`w-full py-3.5 px-4 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-[0.98] select-none ${
                    !pdfHash ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {blockchainStatus === "success" ? "Quay về danh sách" : "Ghi Blockchain"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Wizard Actions Footer */}
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
          <button
            type="button"
            disabled={currentStep === 1 || blockchainStatus === "processing"}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className={`px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 select-none ${
              currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Quay lại
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              disabled={
                (currentStep === 1 && !selectedStudent) || 
                (currentStep === 4 && ipfsStatus !== "success")
              }
              onClick={() => setCurrentStep(prev => prev + 1)}
              className={`px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none ${
                ((currentStep === 1 && !selectedStudent) || (currentStep === 4 && ipfsStatus !== "success"))
                  ? "opacity-50 cursor-not-allowed"
                  : "active:scale-[0.98]"
              }`}
            >
              Tiếp tục
            </button>
          ) : (
            <div className="w-1"></div>
          )}
        </div>
      </div>
    </div>
  );
}
