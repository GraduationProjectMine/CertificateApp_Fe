"use client";
import styles from "./page.module.css";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ocrApi } from "@/features/ocr/services/api";
import type { DiplomaData } from "@/features/ocr/types";
import { useAuth } from "@/features/auth/components/AuthContext";

export default function CreateCertificateWizard() {
  const router = useRouter();
  const { user } = useAuth();
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

  // OCR state
  const [inputMode, setInputMode] = useState<"manual" | "ocr">("manual");
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrLang, setOcrLang] = useState("vie");
  const [ocrError, setOcrError] = useState("");

  const handleOcrFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowed.includes(f.type)) { setOcrError("Chỉ hỗ trợ JPEG, PNG, WebP, TIFF"); return; }
    setOcrFile(f);
    setOcrError("");
    setOcrPreview(URL.createObjectURL(f));
  }, []);

  const handleOcrDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowed.includes(f.type)) { setOcrError("Chỉ hỗ trợ JPEG, PNG, WebP, TIFF"); return; }
    setOcrFile(f);
    setOcrError("");
    setOcrPreview(URL.createObjectURL(f));
  }, []);

  const handleOcrScan = async () => {
    if (!ocrFile) return;
    setOcrScanning(true);
    setOcrError("");
    try {
      const res = await ocrApi.extractDiploma(ocrFile, ocrLang);
      const d = res.data;
      setFormData(prev => ({
        ...prev,
        certName: d.document_title?.trim() || prev.certName,
        serialNumber: d.serial_number?.trim() || prev.serialNumber,
        registryNumber: d.registry_number?.trim() || prev.registryNumber,
        issueDate: d.issue_date ? d.issue_date.split("/").reverse().join("-") : prev.issueDate,
      }));
    } catch (err: any) {
      setOcrError(err.message || "OCR thất bại");
    } finally {
      setOcrScanning(false);
    }
  };

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
    <div className={styles._1}>
      {/* Title */}
      <div>
        <h1 className={styles._2}>Cấp phát văn bằng mới</h1>
        <p className={styles._3}>Quy trình cấp bằng động vĩnh viễn lưu trữ trên IPFS và định danh mật mã hóa trên blockchain.</p>
      </div>

      {/* Progress Wizard Bar */}
      <div className={styles._4}>
        <div className={styles._5}>
          <div className={styles._6}></div>
          <div 
            className={styles._7} 
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          ></div>

          {stepsList.map((s) => (
            <button
              key={s.step}
              disabled={s.step > currentStep && !selectedStudent}
              onClick={() => setCurrentStep(s.step)}
              className={`group ${styles._8}`}
            >
              <div 
                className={`${styles._0} ${
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
                className={`${styles._79} ${
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
      <div className={styles._9}>
        
        {/* STEP 1 CONTENT: SELECT STUDENT */}
        {currentStep === 1 && (
          <div className={styles._10}>
            <div>
              <h2 className={styles._11}>Bước 1: Chọn sinh viên nhận bằng</h2>
              <p className={styles._12}>Tìm kiếm và chọn một sinh viên trong danh sách hồ sơ học tập để tiến hành cấp bằng.</p>
            </div>

            <div className={styles._13}>
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên bằng họ tên hoặc mã số..."
                className={styles._14}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className={styles._15}>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`${styles._80} ${
                        selectedStudent?.id === s.id
                          ? "bg-primary/5 dark:bg-teal-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-gray-800/20"
                      }`}
                    >
                      <div>
                        <span className={styles._16}>{s.name} ({s.code})</span>
                        <span className={styles._17}>{s.email}</span>
                      </div>
                      <div className={styles._18}>
                        <span className={styles._19}>{s.major}</span>
                        <input
                          type="radio"
                          checked={selectedStudent?.id === s.id}
                          onChange={() => {}}
                          className={styles._20}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles._21}>Không tìm thấy sinh viên nào khớp kết quả tìm kiếm.</div>
                )}
              </div>

              {selectedStudent && (
                <div className={styles._22}>
                  <div className={styles._23}>Thông tin sinh viên đã chọn:</div>
                  <div className={styles._24}>
                    <div>
                      <span className={styles._25}>Họ và tên:</span>
                      <span className={styles._26}>{selectedStudent.name}</span>
                    </div>
                    <div>
                      <span className={styles._25}>Mã sinh viên:</span>
                      <span className={styles._26}>{selectedStudent.code}</span>
                    </div>
                    <div>
                      <span className={styles._25}>Ngành học:</span>
                      <span className={styles._26}>{selectedStudent.major}</span>
                    </div>
                    <div>
                      <span className={styles._25}>Hòm thư:</span>
                      <span className={styles._27}>{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 CONTENT: ENTER CREDENTIAL DETAILS */}
        {currentStep === 2 && (
          <div className={styles._10}>
            <div>
              <h2 className={styles._11}>Bước 2: Khai báo thông tin văn bằng</h2>
              <p className={styles._12}>Nhập tay hoặc quét ảnh bằng để tự động điền thông tin.</p>
            </div>

            {/* Input mode tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
              <button
                onClick={() => setInputMode("manual")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  inputMode === "manual"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Nhập tay
              </button>
              <button
                onClick={() => setInputMode("ocr")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  inputMode === "ocr"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                Quét OCR
              </button>
            </div>

            {/* OCR upload panel */}
            {inputMode === "ocr" && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">Chọn ảnh bằng</div>
                  <select
                    value={ocrLang}
                    onChange={(e) => setOcrLang(e.target.value)}
                    className="flex-1 max-w-[160px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="vie">Tiếng Việt</option>
                    <option value="eng">English</option>
                  </select>
                </div>

                {ocrPreview ? (
                  <div className="space-y-3">
                    <img src={ocrPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-800" />
                    {ocrError && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{ocrError}</div>}
                    <div className="flex gap-3">
                      <button onClick={handleOcrScan} disabled={ocrScanning} className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all">
                        {ocrScanning ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Đang xử lý...
                          </span>
                        ) : "Quét văn bằng"}
                      </button>
                      <button onClick={() => { setOcrFile(null); setOcrPreview(null); setOcrError(""); }} className="px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
                        Làm lại
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center gap-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleOcrDrop}
                  >
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kéo thả ảnh vào đây</div>
                    <div className="text-[10px] text-gray-400">hoặc nhấp để chọn file (JPEG, PNG, WebP, TIFF)</div>
                    {ocrError && <div className="text-[11px] text-red-500">{ocrError}</div>}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/tiff" onChange={handleOcrFileSelect} className="hidden" />
                  </label>
                )}
              </div>
            )}

            <div className={styles._28}>
              <div>
                <label className={styles._29}>Tên văn bằng</label>
                <input
                  type="text"
                  className={styles._30}
                  value={formData.certName}
                  onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
                />
              </div>
              <div>
                <label className={styles._29}>Ngành học</label>
                <input
                  type="text"
                  className={styles._30}
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>
              <div>
                <label className={styles._29}>Xếp loại tốt nghiệp</label>
                <select
                  className={styles._30}
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
                <label className={styles._29}>Điểm học tập (GPA)</label>
                <input
                  type="text"
                  className={styles._30}
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                />
              </div>
              <div>
                <label className={styles._29}>Số hiệu văn bằng</label>
                <input
                  type="text"
                  className={styles._30}
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div>
                <label className={styles._29}>Số vào sổ quyết định</label>
                <input
                  type="text"
                  className={styles._30}
                  value={formData.registryNumber}
                  onChange={(e) => setFormData({ ...formData, registryNumber: e.target.value })}
                />
              </div>
              <div>
                <label className={styles._29}>Ngày cấp bằng</label>
                <input
                  type="date"
                  className={styles._30}
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div>
                <label className={styles._29}>Người ký quyết định</label>
                <input
                  type="text"
                  className={styles._30}
                  value={formData.signer}
                  onChange={(e) => setFormData({ ...formData, signer: e.target.value })}
                />
              </div>
            </div>

            {inputMode === "ocr" && (
              <div className="text-[10px] text-gray-400 italic">
                Dữ liệu OCR sẽ tự động điền vào các trường phía trên. Kiểm tra lại trước khi tiếp tục.
              </div>
            )}
          </div>
        )}

        {/* STEP 3 CONTENT: TEMPLATE SELECTOR AND DIGITAL PREVIEW */}
        {currentStep === 3 && (
          <div className={styles._10}>
            <div>
              <h2 className={styles._11}>Bước 3: Chọn mẫu văn bằng & Preview</h2>
              <p className={styles._12}>Xem trước văn bằng thực tế hiển thị động để đảm bảo hình thức thẩm mỹ.</p>
            </div>

            <div className={styles._31}>
              {/* Left templates list */}
              <div className={styles._32}>
                <span className={styles._33}>Mẫu giao diện</span>
                {templates.map((temp) => (
                  <button
                    key={temp.id}
                    onClick={() => setSelectedTemplate(temp.id)}
                    className={`${styles._81} ${
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
              <div className={styles._34}>
                <div className={styles._35}>
                  <div className={styles._36}></div>
                  
                  <div className={styles._37}>
                    <span className={styles._38}>ĐẠI HỌC BÁCH KHOA HÀ NỘI</span>
                    <h3 className={styles._39}>BẰNG CỬ NHÂN</h3>
                  </div>

                  <div className={styles._40}>
                    <div className={styles._41}>
                      <span className={styles._42}>Cấp cho sinh viên</span>
                      <span className={styles._43}>{selectedStudent?.name || "Nguyễn Văn Hùng"}</span>
                    </div>

                    <div className={styles._44}>
                      <div>
                        <span className={styles._45}>Chuyên ngành</span>
                        <span className={styles._46}>{formData.major}</span>
                      </div>
                      <div>
                        <span className={styles._45}>Xếp loại</span>
                        <span className={styles._46}>{formData.classification} (GPA {formData.gpa})</span>
                      </div>
                      <div>
                        <span className={styles._45}>Số hiệu</span>
                        <span className={styles._47}>{formData.serialNumber}</span>
                      </div>
                      <div>
                        <span className={styles._45}>Người ký</span>
                        <span className={styles._48} title={formData.signer}>{formData.signer}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles._49}>
                    <div>
                      <span>Số vào sổ: </span>
                      <span className={styles._50}>{formData.registryNumber}</span>
                    </div>
                    <div className={styles._51}>
                      {/* Fake QR representation */}
                      <div className={styles._52}>QR Code</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 CONTENT: SIGNING & UPLOAD TO IPFS */}
        {currentStep === 4 && (
          <div className={styles._10}>
            <div>
              <h2 className={styles._11}>Bước 4: Ký số & Upload tệp lên IPFS</h2>
              <p className={styles._12}>Tạo tệp PDF văn bằng, mã hóa hash SHA-256 của văn bằng và ký số số hóa trước khi lưu phi tập trung.</p>
            </div>

            <div className={styles._53}>
              <div className={styles._54}>
                <div className={styles._55}>
                  <span>Trạng thái tệp:</span>
                  {ipfsStatus === "idle" && <span className={styles._56}>Chưa xử lý</span>}
                  {ipfsStatus === "processing" && <span className={styles._57}>Đang tải lên IPFS...</span>}
                  {ipfsStatus === "success" && <span className={styles._58}>✓ Hoàn tất</span>}
                </div>
                <div className={styles._59}>
                  <div 
                    className={`${styles._82} ${
                      ipfsStatus === "idle" ? "w-0" : ipfsStatus === "processing" ? "w-1/2" : "w-full"
                    }`}
                  ></div>
                </div>
              </div>

              {ipfsStatus === "success" && (
                <div className={styles._60}>
                  <div>
                    <span className={styles._61}>Mã định danh IPFS CID:</span>
                    <span className={styles._62}>{ipfsCid}</span>
                  </div>
                  <div>
                    <span className={styles._61}>Mã băm SHA-256 PDF:</span>
                    <span className={styles._63}>{pdfHash}</span>
                  </div>
                </div>
              )}

              {ipfsStatus !== "processing" && (
                <button
                  type="button"
                  onClick={runIpfsFlow}
                  className={styles._64}
                >
                  {ipfsStatus === "success" ? "Tạo & Ký số lại" : "Tiến hành Ký số & Upload IPFS"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5 CONTENT: WRITE TO BLOCKCHAIN */}
        {currentStep === 5 && (
          <div className={styles._10}>
            <div>
              <h2 className={styles._11}>Bước 5: Ghi nhận giao dịch Blockchain</h2>
              <p className={styles._12}>Khóa thông tin mã hash/IPFS CID vĩnh viễn lên mạng lưới blockchain thông qua Smart Contract.</p>
            </div>

            <div className={styles._53}>
              <div className={`dark:text-slate-350 ${styles._65}`}>
                <div className={styles._66}>
                  <span>Mạng blockchain:</span>
                  <span className={styles._67}>Sepolia Ethereum Testnet</span>
                </div>
                <div className={styles._66}>
                  <span>Đơn vị phát hành:</span>
                  <span className={styles._67}>{formData.signer}</span>
                </div>
                <div className={styles._66}>
                  <span>Mã băm ghi nhận:</span>
                  <span className={styles._68} title={pdfHash || "Chưa có"}>
                    {pdfHash || "Hãy hoàn thành Bước 4"}
                  </span>
                </div>
              </div>

              {blockchainStatus === "processing" && (
                <div className={styles._69}>
                  <svg className={styles._70} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className={styles._71} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className={styles._72} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className={styles._73}>Đang gửi giao dịch Smart Contract, vui lòng ký xác nhận ví MetaMask...</span>
                </div>
              )}

              {blockchainStatus === "success" && (
                <div className={styles._74}>
                  <div className={styles._75}>
                    <span>✓ Cấp phát văn bằng On-chain thành công!</span>
                  </div>
                  <div>
                    <span className={styles._61}>Transaction Hash:</span>
                    <span className={styles._76}>{txHash}</span>
                  </div>
                </div>
              )}

              {blockchainStatus !== "processing" && (
                <button
                  type="button"
                  disabled={!pdfHash || user?.role === 'issuer_staff'}
                  onClick={blockchainStatus === "success" ? () => router.push("/admin/certificates") : runBlockchainFlow}
                  className={`${styles._83} ${
                    !pdfHash || user?.role === 'issuer_staff' ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title={user?.role === 'issuer_staff' ? "Nhân viên chỉ có thể lưu nháp" : ""}
                >
                  {blockchainStatus === "success" ? "Quay về danh sách" : "Ghi Blockchain"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Wizard Actions Footer */}
        <div className={styles._77}>
          <button
            type="button"
            disabled={currentStep === 1 || blockchainStatus === "processing"}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className={`${styles._84} ${
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
              className={`${styles._85} ${
                ((currentStep === 1 && !selectedStudent) || (currentStep === 4 && ipfsStatus !== "success"))
                  ? "opacity-50 cursor-not-allowed"
                  : "active:scale-[0.98]"
              }`}
            >
              Tiếp tục
            </button>
          ) : (
            <div className={styles._78}></div>
          )}
        </div>
      </div>
    </div>
  );
}
