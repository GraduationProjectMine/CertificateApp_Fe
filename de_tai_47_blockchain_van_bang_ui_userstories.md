# ĐỀ TÀI 47 — PHÂN TÍCH GIAO DIỆN, USER STORY VÀ THIẾT KẾ HỆ THỐNG

## Tên đề tài

**Ứng dụng blockchain để xây dựng hệ thống cấp phát, lưu trữ và xác minh văn bằng/chứng chỉ chống giả mạo**

---

## 1. Mục tiêu tài liệu

Tài liệu này dùng để định hướng thiết kế giao diện, phân tích chức năng, chia user story và chuẩn bị triển khai frontend bằng React cho đề tài tốt nghiệp.

Hệ thống lấy cảm hứng từ các nền tảng cấp phát chứng chỉ số như Sertifier/Certifier, nhưng điểm khác biệt chính của đề tài là:

- Văn bằng/chứng chỉ được số hóa.
- File hoặc metadata văn bằng được lưu trên IPFS.
- Hash/CID/trạng thái được ghi lên blockchain thông qua smart contract.
- Nhà tuyển dụng hoặc người dùng có thể xác minh văn bằng qua mã số, QR code hoặc file PDF.
- Hệ thống có 3 nhóm người dùng chính:
  - Admin trường đại học/tổ chức giáo dục.
  - Sinh viên/người nhận văn bằng.
  - Nhà tuyển dụng/bên xác minh.

---

## 2. Căn cứ thiết kế và nguồn tham khảo

### 2.1. Cảm hứng từ Sertifier

Các điểm nên học theo Sertifier:

- Giao diện SaaS hiện đại, sạch, dễ dùng.
- Có dashboard quản trị.
- Có chức năng tạo, cấp phát và quản lý chứng chỉ số.
- Có public credential page.
- Có QR code để xác minh.
- Có thống kê lượt xem, lượt chia sẻ, hiệu quả chương trình.
- Có phân quyền người dùng trong tổ chức.
- Có báo cáo và export dữ liệu.

### 2.2. Chuẩn W3C Verifiable Credentials

Đề tài có thể diễn giải theo mô hình 3 bên:

| Thành phần W3C | Ánh xạ vào đề tài |
|---|---|
| Issuer | Trường đại học/tổ chức giáo dục |
| Holder | Sinh viên/người nhận bằng |
| Verifier | Nhà tuyển dụng/người xác minh |

### 2.3. IPFS

IPFS dùng cơ chế định danh nội dung bằng CID. Nếu file hoặc metadata thay đổi, CID/hash cũng thay đổi. Đây là nền tảng quan trọng để chứng minh dữ liệu không bị sửa đổi âm thầm.

### 2.4. Smart Contract

Smart contract dùng để:

- Ghi nhận hash văn bằng.
- Ghi nhận CID IPFS.
- Lưu trạng thái hợp lệ/thu hồi.
- Kiểm tra văn bằng.
- Phân quyền ai được cấp bằng, ai được thu hồi.

---

## 3. Phạm vi hệ thống

### 3.1. Module chính

Hệ thống gồm 3 module chính:

1. **Admin Module**
   - Dành cho trường đại học/tổ chức giáo dục.
   - Quản lý sinh viên.
   - Thiết kế mẫu bằng.
   - Cấp bằng/chứng chỉ.
   - Upload IPFS.
   - Ghi blockchain.
   - Thu hồi văn bằng.
   - Xem thống kê và audit log.

2. **Student Module**
   - Dành cho sinh viên/người nhận văn bằng.
   - Xem danh sách bằng.
   - Xem chi tiết bằng.
   - Tải PDF.
   - Lấy QR code.
   - Chia sẻ public link.
   - Theo dõi lịch sử xác minh.

3. **Employer Module**
   - Dành cho nhà tuyển dụng/bên thứ ba.
   - Xác minh văn bằng bằng mã số.
   - Quét QR code.
   - Upload PDF để kiểm tra hash.
   - Lưu lịch sử xác minh.
   - Lưu ứng viên.

### 3.2. Module phụ nên có

Ngoài 3 module chính, nên có thêm:

- Public site.
- Auth site.
- Public verification page.
- Public credential detail page.
- Comparison page: so sánh blockchain/IPFS với lưu trữ truyền thống.
- API documentation page nếu muốn mở rộng.

---

## 4. Vai trò người dùng

## 4.1. System Admin

Đây là người quản trị toàn hệ thống.

### Nhiệm vụ

- Quản lý các trường đại học/tổ chức giáo dục.
- Tạo tài khoản admin cho từng trường.
- Cấu hình network blockchain.
- Theo dõi lỗi toàn hệ thống.
- Quản lý smart contract address.
- Quản lý gói hoặc quyền sử dụng nếu triển khai dạng SaaS.

### Có cần làm trong MVP không?

Có thể làm đơn giản hoặc bỏ qua nếu phạm vi đồ án chỉ yêu cầu 3 module chính. Tuy nhiên, nếu muốn hệ thống giống SaaS thật, nên có.

---

## 4.2. University Admin / Admin trường

Đây là vai trò quan trọng nhất.

### Nhiệm vụ

- Quản lý sinh viên.
- Quản lý mẫu bằng.
- Tạo văn bằng.
- Cấp bằng đơn lẻ.
- Cấp bằng hàng loạt.
- Upload file/metadata lên IPFS.
- Ký số và ghi blockchain.
- Thu hồi văn bằng.
- Quản lý người dùng nội bộ trường.
- Xem thống kê.

---

## 4.3. Credential Manager

Đây là người phụ trách nghiệp vụ cấp bằng trong trường.

### Nhiệm vụ

- Tạo văn bằng.
- Kiểm tra dữ liệu.
- Gửi duyệt.
- Cấp bằng nếu được phân quyền.
- Theo dõi trạng thái cấp bằng.

---

## 4.4. Template Designer

Đây là người thiết kế mẫu bằng/chứng chỉ.

### Nhiệm vụ

- Tạo mẫu bằng.
- Kéo thả các trường động.
- Gắn QR code.
- Upload chữ ký, logo, background.
- Preview mẫu bằng.

---

## 4.5. Auditor

Đây là người kiểm tra lịch sử hệ thống.

### Nhiệm vụ

- Xem audit log.
- Xem lịch sử cấp bằng.
- Xem lịch sử thu hồi.
- Xem lịch sử xác minh.
- Không được sửa dữ liệu.

---

## 4.6. Student / Holder

Đây là sinh viên/người nhận văn bằng.

### Nhiệm vụ

- Đăng nhập.
- Xem văn bằng.
- Tải PDF.
- Lấy QR code.
- Chia sẻ link xác minh.
- Theo dõi lượt xem/lượt xác minh.
- Cập nhật hồ sơ cá nhân.

---

## 4.7. Employer / Verifier

Đây là nhà tuyển dụng hoặc bên thứ ba cần xác minh.

### Nhiệm vụ

- Xác minh bằng mã số.
- Xác minh bằng QR code.
- Xác minh bằng file PDF.
- Xem kết quả xác minh.
- Lưu lịch sử xác minh.
- Lưu ứng viên.
- Xuất báo cáo xác minh.

---

## 5. Kiến trúc giao diện tổng quan

## 5.1. Public Site

Các route chính:

```txt
/
 /verify
 /credential/:credentialId
 /comparison
 /login
 /register
 /forgot-password
```

## 5.2. Admin Site

Các route chính:

```txt
/admin/dashboard
/admin/students
/admin/students/:id
/admin/credentials
/admin/credentials/create
/admin/credentials/:id
/admin/templates
/admin/templates/create
/admin/templates/:id/edit
/admin/batches
/admin/batches/:id
/admin/revocations
/admin/blockchain
/admin/users
/admin/audit-logs
/admin/settings
```

## 5.3. Student Site

Các route chính:

```txt
/student/dashboard
/student/credentials
/student/credentials/:id
/student/wallet
/student/share
/student/profile
/student/support
```

## 5.4. Employer Site

Các route chính:

```txt
/employer/dashboard
/employer/verify
/employer/history
/employer/candidates
/employer/reports
/employer/profile
```

---

# 6. Định hướng UI/UX tổng thể

## 6.1. Phong cách thiết kế

Phong cách nên đi theo SaaS hiện đại:

- Nền sáng.
- Sidebar trái.
- Topbar có search, notification, avatar.
- Card bo góc.
- Bảng dữ liệu có filter.
- Badge trạng thái rõ màu.
- Giao diện cấp bằng dạng wizard nhiều bước.
- Credential preview đặt nổi bật.
- Public verification page đơn giản, dễ dùng, không bắt đăng nhập.

## 6.2. Màu sắc đề xuất

```txt
Background: #F8FAFC
Card: #FFFFFF
Primary: #0F766E
Secondary: #2563EB
Success: #22C55E
Warning: #F59E0B
Danger: #EF4444
Text main: #0F172A
Text muted: #64748B
Border: #E2E8F0
```

## 6.3. Trạng thái văn bằng

Nên có các trạng thái sau:

| Trạng thái | Ý nghĩa |
|---|---|
| Draft | Mới tạo nháp, chưa cấp |
| Pending Review | Chờ duyệt |
| Pending IPFS | Đang chờ upload IPFS |
| IPFS Uploaded | Đã upload IPFS |
| Pending Blockchain | Đang chờ ghi blockchain |
| Issued | Đã cấp |
| Verified | Hợp lệ |
| Revoked | Đã thu hồi |
| Failed | Lỗi xử lý |

## 6.4. Badge trạng thái

| Trạng thái | Màu |
|---|---|
| Verified/Issued | Xanh |
| Pending | Vàng |
| Failed | Đỏ |
| Revoked | Đỏ đậm |
| Draft | Xám |
| On-chain | Xanh dương |

---

# 7. Danh sách giao diện chi tiết

---

# PHẦN A — PUBLIC SITE

## 7.1. Trang chủ

### Route

```txt
/
```

### Mục tiêu

Giới thiệu nền tảng cấp phát và xác minh văn bằng bằng blockchain.

### Thành phần giao diện

- Header:
  - Logo.
  - Giải pháp.
  - Công nghệ.
  - Xác minh bằng.
  - Đăng nhập.
- Hero:
  - Tiêu đề lớn.
  - Mô tả ngắn.
  - CTA: Xác minh ngay.
  - CTA: Đăng nhập hệ thống.
- Quy trình 3 bước:
  - Trường cấp bằng.
  - Ghi IPFS/blockchain.
  - Nhà tuyển dụng xác minh.
- Công nghệ sử dụng:
  - Smart Contract.
  - IPFS.
  - QR Code.
  - Digital Signature.
- Lợi ích:
  - Chống giả mạo.
  - Minh bạch.
  - Tra cứu nhanh.
  - Giảm phụ thuộc lưu trữ tập trung.
- Footer.

### User Story

**US-PUBLIC-01**

Là người truy cập, tôi muốn xem trang giới thiệu hệ thống để hiểu hệ thống dùng blockchain/IPFS xác minh văn bằng như thế nào.

### Acceptance Criteria

- Người dùng thấy rõ mục đích hệ thống trong 5 giây đầu.
- Có nút đi tới trang xác minh.
- Có nút đi tới đăng nhập.
- Có mô tả quy trình cấp và xác minh bằng.
- Giao diện responsive trên desktop/mobile.

### Priority

Must-have.

---

## 7.2. Trang xác minh công khai

### Route

```txt
/verify
```

### Mục tiêu

Cho phép bất kỳ ai xác minh văn bằng mà không cần đăng nhập.

### Thành phần giao diện

- Form nhập mã văn bằng.
- Form nhập transaction hash.
- Nút quét QR.
- Upload file PDF để kiểm tra hash.
- Khu vực hiển thị kết quả.
- Hướng dẫn cách kiểm tra.
- Link xem chi tiết public credential.

### Kết quả xác minh

#### Trường hợp hợp lệ

Hiển thị:

- Trạng thái: Hợp lệ.
- Họ tên người nhận.
- Tên văn bằng.
- Trường cấp.
- Ngày cấp.
- Mã văn bằng.
- Hash văn bằng.
- CID IPFS.
- Transaction hash.
- Contract address.
- Network.
- Nút xem chi tiết.

#### Trường hợp không hợp lệ

Hiển thị:

- Trạng thái: Không hợp lệ.
- Lý do:
  - Không tìm thấy mã.
  - Hash không khớp.
  - File đã bị chỉnh sửa.
  - Transaction không tồn tại.
- Gợi ý liên hệ tổ chức cấp.

#### Trường hợp bị thu hồi

Hiển thị:

- Trạng thái: Đã thu hồi.
- Ngày thu hồi.
- Lý do thu hồi.
- Đơn vị thu hồi.
- Transaction thu hồi.

### User Story

**US-PUBLIC-02**

Là nhà tuyển dụng chưa đăng nhập, tôi muốn nhập mã văn bằng để kiểm tra tính xác thực của văn bằng.

### Acceptance Criteria

- Người dùng nhập mã và bấm xác minh.
- Hệ thống trả về kết quả hợp lệ/không hợp lệ/đã thu hồi.
- Nếu hợp lệ, hệ thống hiển thị thông tin cơ bản của văn bằng.
- Nếu không hợp lệ, hệ thống hiển thị lý do rõ ràng.
- Không yêu cầu đăng nhập.

### User Story

**US-PUBLIC-03**

Là nhà tuyển dụng, tôi muốn quét QR code trên văn bằng để mở nhanh trang xác minh.

### Acceptance Criteria

- Người dùng mở camera để quét QR.
- QR dẫn tới `/credential/:credentialId` hoặc `/verify?code=...`.
- Hệ thống tự động kiểm tra trạng thái văn bằng.
- Nếu camera không hỗ trợ, có phương án nhập mã thủ công.

### User Story

**US-PUBLIC-04**

Là nhà tuyển dụng, tôi muốn upload file PDF văn bằng để kiểm tra file có bị chỉnh sửa hay không.

### Acceptance Criteria

- Người dùng upload file PDF.
- Frontend hoặc backend tạo SHA-256 hash của file.
- Hệ thống so sánh hash với dữ liệu on-chain/database.
- Hiển thị kết quả khớp hoặc không khớp.
- Không lưu file upload vĩnh viễn nếu không cần thiết.

### Priority

Must-have.

---

## 7.3. Trang public credential detail

### Route

```txt
/credential/:credentialId
```

### Mục tiêu

Hiển thị chi tiết văn bằng công khai để sinh viên chia sẻ cho nhà tuyển dụng.

### Thành phần giao diện

- Preview bằng/chứng chỉ.
- Trạng thái xác minh.
- QR code.
- Tên sinh viên.
- Mã sinh viên, nếu được phép công khai.
- Tên văn bằng.
- Trường cấp.
- Ngày cấp.
- Số hiệu văn bằng.
- Số vào sổ.
- Blockchain info.
- IPFS info.
- Nút tải PDF.
- Nút copy link.
- Nút xem transaction trên explorer.

### User Story

**US-PUBLIC-05**

Là nhà tuyển dụng, tôi muốn xem trang chi tiết công khai của văn bằng để kiểm tra thông tin trước khi tuyển dụng.

### Acceptance Criteria

- Trang hiển thị đầy đủ thông tin cần xác minh.
- Có trạng thái xác minh rõ ràng.
- Có thông tin blockchain/IPFS.
- Có QR code.
- Có link kiểm tra transaction.
- Nếu văn bằng bị thu hồi, trạng thái phải hiển thị nổi bật.

### Priority

Must-have.

---

## 7.4. Trang so sánh giải pháp

### Route

```txt
/comparison
```

### Mục tiêu

Hỗ trợ báo cáo đồ án, cho thấy ưu nhược điểm blockchain/IPFS so với lưu trữ truyền thống.

### Nội dung

| Tiêu chí | Lưu trữ truyền thống | Blockchain + IPFS |
|---|---|---|
| Khả năng chỉnh sửa dữ liệu | Có thể sửa trong DB | Dữ liệu hash on-chain khó sửa |
| Xác minh công khai | Phụ thuộc nhà trường | Có thể xác minh bằng public link/QR |
| Chống giả mạo | Trung bình | Cao hơn nhờ hash + chữ ký |
| Chi phí | Chi phí server | Có thêm gas/IPFS pinning |
| Hiệu năng | Nhanh | Phụ thuộc network |
| Tính minh bạch | Nội bộ | Công khai hơn |
| Khả năng thu hồi | Dễ cập nhật DB | Cần ghi trạng thái revoke |
| Rủi ro | DB bị sửa/xóa | Lộ private key, lỗi contract |

### User Story

**US-PUBLIC-06**

Là hội đồng chấm đồ án, tôi muốn xem phần so sánh giải pháp để hiểu giá trị của blockchain/IPFS so với hệ thống truyền thống.

### Acceptance Criteria

- Có bảng so sánh rõ ràng.
- Có ưu điểm.
- Có nhược điểm.
- Có giải thích ngắn.
- Có thể đưa nội dung này vào báo cáo.

### Priority

Should-have.

---

# PHẦN B — AUTH SITE

## 7.5. Trang đăng nhập

### Route

```txt
/login
```

### Thành phần giao diện

- Email.
- Password.
- Remember me.
- Forgot password.
- Nút đăng nhập.
- Link đăng ký nhà tuyển dụng.
- Có thể đăng nhập theo role hoặc tự redirect theo role.

### Logic điều hướng

Sau khi đăng nhập:

| Role | Redirect |
|---|---|
| Admin | `/admin/dashboard` |
| Student | `/student/dashboard` |
| Employer | `/employer/dashboard` |
| System Admin | `/system/dashboard` |

### User Story

**US-AUTH-01**

Là người dùng có tài khoản, tôi muốn đăng nhập để truy cập đúng trang theo vai trò của mình.

### Acceptance Criteria

- Đăng nhập thành công khi email/password đúng.
- Hệ thống tự nhận diện role.
- Redirect đúng dashboard theo role.
- Hiển thị lỗi nếu sai thông tin.
- Token được lưu an toàn.

### Priority

Must-have.

---

## 7.6. Trang đăng ký nhà tuyển dụng

### Route

```txt
/register/employer
```

### Thành phần giao diện

- Tên công ty.
- Mã số thuế, tùy chọn.
- Người đại diện.
- Email.
- Số điện thoại.
- Password.
- Confirm password.
- Điều khoản sử dụng.

### User Story

**US-AUTH-02**

Là nhà tuyển dụng, tôi muốn đăng ký tài khoản để lưu lịch sử xác minh văn bằng.

### Acceptance Criteria

- Người dùng tạo được tài khoản employer.
- Email không được trùng.
- Password được validate.
- Sau khi đăng ký, người dùng có thể đăng nhập.
- Có thể yêu cầu xác minh email.

### Priority

Should-have.

---

## 7.7. Trang quên mật khẩu

### Route

```txt
/forgot-password
```

### User Story

**US-AUTH-03**

Là người dùng, tôi muốn đặt lại mật khẩu khi quên mật khẩu.

### Acceptance Criteria

- Nhập email.
- Hệ thống gửi link reset.
- Link reset có thời hạn.
- Đặt mật khẩu mới thành công.

### Priority

Could-have.

---

# PHẦN C — ADMIN SITE

---

## 7.8. Admin Layout

### Route cha

```txt
/admin/*
```

### Thành phần layout

- Sidebar trái:
  - Dashboard.
  - Sinh viên.
  - Văn bằng.
  - Cấp bằng.
  - Mẫu bằng.
  - Lô cấp phát.
  - Thu hồi.
  - IPFS/Blockchain.
  - Người dùng.
  - Audit logs.
  - Cài đặt.
- Topbar:
  - Search.
  - Notification.
  - Wallet status.
  - Avatar.
- Main content.
- Breadcrumb.

### User Story

**US-ADMIN-LAYOUT-01**

Là admin trường, tôi muốn có sidebar rõ ràng để truy cập nhanh các chức năng quản trị.

### Acceptance Criteria

- Sidebar hiển thị đúng menu.
- Menu active theo route.
- Có responsive collapse.
- Người dùng chỉ thấy menu theo quyền.

### Priority

Must-have.

---

## 7.9. Admin Dashboard

### Route

```txt
/admin/dashboard
```

### Mục tiêu

Cung cấp cái nhìn tổng quan về hoạt động cấp phát và xác minh văn bằng.

### Thành phần giao diện

#### Card thống kê

- Tổng số sinh viên.
- Tổng số văn bằng.
- Văn bằng đã cấp.
- Văn bằng đã ghi blockchain.
- Văn bằng đang chờ xử lý.
- Văn bằng bị thu hồi.
- Lượt xác minh tháng này.
- Lỗi IPFS/blockchain.

#### Biểu đồ

- Số văn bằng cấp theo tháng.
- Số lượt xác minh theo ngày.
- Tỷ lệ trạng thái văn bằng.
- Top ngành/khoa có nhiều văn bằng.

#### Bảng dữ liệu gần đây

- Văn bằng vừa cấp.
- Giao dịch blockchain mới nhất.
- Lượt xác minh mới nhất.
- Lỗi cần xử lý.

### User Story

**US-ADMIN-01**

Là admin trường, tôi muốn xem dashboard tổng quan để biết tình hình cấp phát và xác minh văn bằng.

### Acceptance Criteria

- Hiển thị các card thống kê chính.
- Hiển thị biểu đồ cấp bằng theo thời gian.
- Hiển thị danh sách giao dịch gần đây.
- Hiển thị lỗi IPFS/blockchain nếu có.
- Dữ liệu cập nhật theo tổ chức của admin.

### Priority

Must-have.

---

## 7.10. Quản lý sinh viên

### Route

```txt
/admin/students
```

### Mục tiêu

Quản lý danh sách sinh viên/người nhận văn bằng.

### Thành phần giao diện

- Bảng danh sách sinh viên.
- Search theo mã sinh viên, họ tên, email.
- Filter theo khoa, ngành, khóa, trạng thái.
- Nút thêm sinh viên.
- Nút import Excel/CSV.
- Nút export danh sách.
- Menu hành động từng dòng:
  - Xem chi tiết.
  - Sửa.
  - Khóa tài khoản.
  - Cấp bằng.

### Cột bảng

```txt
Mã SV | Họ tên | Email | Khoa | Ngành | Khóa | Trạng thái | Số văn bằng | Hành động
```

### User Story

**US-ADMIN-STUDENT-01**

Là admin trường, tôi muốn xem danh sách sinh viên để quản lý người nhận văn bằng.

### Acceptance Criteria

- Hiển thị bảng sinh viên.
- Có tìm kiếm.
- Có filter.
- Có phân trang.
- Có nút xem chi tiết.

### User Story

**US-ADMIN-STUDENT-02**

Là admin trường, tôi muốn thêm sinh viên mới để có thể cấp văn bằng cho sinh viên đó.

### Acceptance Criteria

- Có form thêm sinh viên.
- Validate mã sinh viên không trùng.
- Validate email hợp lệ.
- Lưu thành công vào hệ thống.
- Sinh viên mới có trạng thái active hoặc pending.

### User Story

**US-ADMIN-STUDENT-03**

Là admin trường, tôi muốn import danh sách sinh viên bằng Excel/CSV để tiết kiệm thời gian nhập liệu.

### Acceptance Criteria

- Upload được file Excel/CSV.
- Preview dữ liệu trước khi import.
- Mapping cột dữ liệu.
- Báo lỗi dòng bị thiếu thông tin.
- Import thành công các dòng hợp lệ.
- Có file log lỗi hoặc danh sách dòng lỗi.

### Priority

Must-have.

---

## 7.11. Chi tiết sinh viên

### Route

```txt
/admin/students/:id
```

### Thành phần giao diện

- Thông tin cá nhân.
- Thông tin học tập.
- Danh sách văn bằng đã cấp.
- Lịch sử chỉnh sửa.
- Nút cấp bằng mới.
- Nút khóa tài khoản.

### User Story

**US-ADMIN-STUDENT-04**

Là admin trường, tôi muốn xem chi tiết một sinh viên để kiểm tra thông tin và các văn bằng đã cấp.

### Acceptance Criteria

- Hiển thị thông tin sinh viên.
- Hiển thị danh sách văn bằng của sinh viên.
- Có nút cấp bằng mới.
- Có lịch sử chỉnh sửa.
- Chỉ admin có quyền mới sửa được.

### Priority

Must-have.

---

## 7.12. Quản lý văn bằng

### Route

```txt
/admin/credentials
```

### Mục tiêu

Quản lý toàn bộ văn bằng/chứng chỉ trong trường.

### Thành phần giao diện

- Bảng danh sách văn bằng.
- Search theo mã văn bằng, sinh viên, số hiệu.
- Filter theo loại bằng, ngành, ngày cấp, trạng thái.
- Nút tạo văn bằng.
- Nút cấp hàng loạt.
- Menu hành động:
  - Xem.
  - Tải PDF.
  - Xem public page.
  - Xem transaction.
  - Thu hồi.

### Cột bảng

```txt
Mã bằng | Sinh viên | Loại bằng | Ngành | Ngày cấp | IPFS | Blockchain | Trạng thái | Hành động
```

### User Story

**US-ADMIN-CREDENTIAL-01**

Là admin trường, tôi muốn xem danh sách văn bằng đã tạo/cấp để quản lý toàn bộ dữ liệu văn bằng.

### Acceptance Criteria

- Bảng hiển thị đủ thông tin chính.
- Có filter theo trạng thái.
- Có search theo mã bằng.
- Có phân trang.
- Có action xem chi tiết.

### User Story

**US-ADMIN-CREDENTIAL-02**

Là admin trường, tôi muốn lọc các văn bằng chưa ghi blockchain để xử lý tiếp.

### Acceptance Criteria

- Có filter trạng thái Pending Blockchain.
- Hệ thống hiển thị đúng danh sách.
- Có nút xử lý lại cho từng văn bằng.
- Có thông báo lỗi nếu blockchain call thất bại.

### Priority

Must-have.

---

## 7.13. Tạo/cấp văn bằng mới dạng Wizard

### Route

```txt
/admin/credentials/create
```

### Mục tiêu

Tạo quy trình cấp bằng số rõ ràng, dễ theo dõi, đúng nghiệp vụ.

### Wizard gồm 5 bước

---

### Bước 1: Chọn sinh viên

#### Giao diện

- Search sinh viên.
- Chọn một sinh viên.
- Hiển thị thông tin sinh viên.
- Cảnh báo nếu sinh viên thiếu email/mã sinh viên.

#### User Story

**US-ADMIN-ISSUE-01**

Là admin trường, tôi muốn chọn sinh viên để bắt đầu cấp văn bằng.

#### Acceptance Criteria

- Tìm được sinh viên theo mã/họ tên/email.
- Chọn được một sinh viên.
- Hiển thị thông tin sinh viên đã chọn.
- Không cho sang bước tiếp nếu chưa chọn sinh viên.

---

### Bước 2: Nhập thông tin văn bằng

#### Giao diện

- Loại văn bằng.
- Tên văn bằng.
- Ngành học.
- Khoa.
- Xếp loại.
- GPA, tùy chọn.
- Số hiệu văn bằng.
- Số vào sổ.
- Ngày cấp.
- Người ký.
- Đơn vị cấp.
- Ghi chú.

#### User Story

**US-ADMIN-ISSUE-02**

Là admin trường, tôi muốn nhập thông tin văn bằng để tạo dữ liệu cấp bằng chính xác.

#### Acceptance Criteria

- Form có đầy đủ trường bắt buộc.
- Số hiệu văn bằng không được trùng.
- Ngày cấp hợp lệ.
- Có validate dữ liệu.
- Có lưu nháp.

---

### Bước 3: Chọn mẫu bằng và preview

#### Giao diện

- Danh sách mẫu bằng.
- Preview bằng với dữ liệu thực tế.
- Chỉnh nhanh font/kích thước nếu cần.
- Kiểm tra vị trí QR.
- Kiểm tra chữ ký/logo.

#### User Story

**US-ADMIN-ISSUE-03**

Là admin trường, tôi muốn chọn mẫu bằng và xem trước để đảm bảo nội dung hiển thị đúng trước khi cấp.

#### Acceptance Criteria

- Chọn được template.
- Preview hiển thị đúng dữ liệu sinh viên/văn bằng.
- QR code được hiển thị trên preview.
- Có nút quay lại chỉnh dữ liệu.
- Không cho cấp nếu chưa chọn template.

---

### Bước 4: Ký số, tạo hash và upload IPFS

#### Giao diện

Hiển thị checklist kỹ thuật:

```txt
[ ] Tạo file PDF văn bằng
[ ] Tạo hash SHA-256
[ ] Ký số bởi tổ chức cấp
[ ] Upload file/metadata lên IPFS
[ ] Nhận CID IPFS
```

#### Thành phần dữ liệu

- File PDF.
- Hash PDF.
- Metadata JSON.
- CID IPFS.
- Signature.
- Issuer wallet address.

#### User Story

**US-ADMIN-ISSUE-04**

Là admin trường, tôi muốn hệ thống tạo hash và upload dữ liệu lên IPFS để đảm bảo văn bằng có thể kiểm tra tính toàn vẹn.

#### Acceptance Criteria

- Tạo được file PDF từ template.
- Tạo được hash của PDF/metadata.
- Upload thành công lên IPFS.
- Hệ thống nhận CID.
- Nếu lỗi IPFS, hiển thị lỗi và cho retry.
- CID được lưu vào database.

---

### Bước 5: Ghi blockchain

#### Giao diện

- Network đang dùng.
- Contract address.
- Issuer wallet.
- Credential hash.
- IPFS CID.
- Gas estimate.
- Nút ghi blockchain.
- Loading transaction.
- Kết quả transaction.

#### User Story

**US-ADMIN-ISSUE-05**

Là admin trường, tôi muốn ghi hash/CID văn bằng lên blockchain để chống giả mạo và cho phép xác minh công khai.

#### Acceptance Criteria

- Hiển thị dữ liệu trước khi ghi.
- Chỉ người có quyền mới được ghi blockchain.
- Gọi smart contract thành công.
- Lưu transaction hash.
- Cập nhật trạng thái văn bằng là Issued/On-chain.
- Nếu lỗi, trạng thái chuyển Failed hoặc Pending Retry.

### Priority

Must-have.

---

## 7.14. Chi tiết văn bằng Admin

### Route

```txt
/admin/credentials/:id
```

### Thành phần giao diện

- Preview bằng.
- Thông tin sinh viên.
- Thông tin văn bằng.
- Trạng thái.
- QR code.
- IPFS CID.
- Transaction hash.
- Contract address.
- Audit trail.
- Nút:
  - Tải PDF.
  - Xem public page.
  - Ghi blockchain lại nếu lỗi.
  - Thu hồi.
  - Xuất báo cáo.

### User Story

**US-ADMIN-CREDENTIAL-03**

Là admin trường, tôi muốn xem chi tiết một văn bằng để kiểm tra đầy đủ thông tin, trạng thái IPFS và blockchain.

### Acceptance Criteria

- Hiển thị preview văn bằng.
- Hiển thị trạng thái cấp phát.
- Hiển thị IPFS CID.
- Hiển thị transaction hash.
- Có link public credential.
- Có audit trail.

### Priority

Must-have.

---

## 7.15. Quản lý mẫu bằng

### Route

```txt
/admin/templates
```

### Mục tiêu

Tạo và quản lý các mẫu bằng/chứng chỉ.

### Thành phần giao diện

- Danh sách template.
- Preview nhỏ.
- Tên template.
- Loại văn bằng.
- Ngày tạo.
- Người tạo.
- Trạng thái active/inactive.
- Nút tạo template.
- Nút sửa.
- Nút nhân bản.
- Nút xóa.

### User Story

**US-ADMIN-TEMPLATE-01**

Là admin/template designer, tôi muốn xem danh sách mẫu bằng để quản lý và tái sử dụng khi cấp văn bằng.

### Acceptance Criteria

- Hiển thị danh sách template.
- Có preview.
- Có filter theo loại bằng.
- Có nút tạo mới.
- Có nút chỉnh sửa.

### Priority

Must-have.

---

## 7.16. Template Editor

### Route

```txt
/admin/templates/create
/admin/templates/:id/edit
```

### Mục tiêu

Thiết kế mẫu bằng theo phong cách drag-and-drop giống nền tảng certificate SaaS.

### Bố cục giao diện

```txt
Topbar:
- Tên template
- Preview
- Save
- Publish

Sidebar trái:
- Text
- Image
- QR Code
- Signature
- Dynamic Fields
- Shapes

Canvas giữa:
- Khung bằng/chứng chỉ

Panel phải:
- Font
- Size
- Color
- Position
- Layer
- Alignment
```

### Dynamic Fields

Các trường động cần hỗ trợ:

```txt
{{student.name}}
{{student.code}}
{{student.email}}
{{credential.name}}
{{credential.type}}
{{credential.major}}
{{credential.classification}}
{{credential.issueDate}}
{{credential.serialNumber}}
{{credential.registryNumber}}
{{issuer.name}}
{{issuer.logo}}
{{issuer.signature}}
{{credential.qrCode}}
{{credential.verifyUrl}}
```

### User Story

**US-ADMIN-TEMPLATE-02**

Là template designer, tôi muốn kéo thả các trường động vào mẫu bằng để khi cấp bằng hệ thống tự động đổ dữ liệu.

### Acceptance Criteria

- Kéo được text vào canvas.
- Thêm được dynamic field.
- Thêm được QR code.
- Upload được logo/chữ ký.
- Lưu được template.
- Preview template với dữ liệu mẫu.

### User Story

**US-ADMIN-TEMPLATE-03**

Là admin trường, tôi muốn gắn QR code vào mẫu bằng để người khác có thể xác minh nhanh.

### Acceptance Criteria

- Có component QR code.
- QR chứa public verification URL.
- QR hiển thị đúng trên PDF.
- QR quét được sau khi export.

### Priority

Should-have/Must-have tùy thời gian.

---

## 7.17. Cấp bằng hàng loạt

### Route

```txt
/admin/batches
/admin/batches/:id
```

### Mục tiêu

Cho phép trường cấp văn bằng cho nhiều sinh viên cùng lúc.

### Thành phần giao diện

- Danh sách lô cấp phát.
- Nút tạo lô mới.
- Upload Excel/CSV.
- Mapping cột.
- Validate dữ liệu.
- Preview danh sách.
- Tiến trình xử lý.
- Kết quả từng dòng.
- Download file lỗi.

### User Story

**US-ADMIN-BATCH-01**

Là admin trường, tôi muốn upload file Excel danh sách sinh viên và văn bằng để cấp hàng loạt.

### Acceptance Criteria

- Upload được Excel/CSV.
- Mapping được các cột.
- Validate dữ liệu trước khi cấp.
- Hiển thị số dòng hợp lệ/lỗi.
- Cho phép xác nhận cấp hàng loạt.

### User Story

**US-ADMIN-BATCH-02**

Là admin trường, tôi muốn theo dõi tiến trình cấp bằng hàng loạt để biết dòng nào thành công hoặc thất bại.

### Acceptance Criteria

- Hiển thị progress.
- Mỗi dòng có trạng thái.
- Có retry dòng lỗi.
- Có log lỗi.
- Có export kết quả.

### Priority

Should-have.

---

## 7.18. Thu hồi văn bằng

### Route

```txt
/admin/revocations
```

### Mục tiêu

Cho phép trường thu hồi văn bằng khi phát hiện sai thông tin hoặc quyết định thu hồi.

### Thành phần giao diện

- Tìm văn bằng theo mã.
- Xem thông tin văn bằng.
- Form lý do thu hồi.
- Upload quyết định thu hồi, tùy chọn.
- Xác nhận hành động.
- Ghi blockchain trạng thái revoke.
- Lịch sử thu hồi.

### User Story

**US-ADMIN-REVOKE-01**

Là admin trường, tôi muốn thu hồi một văn bằng đã cấp để public verification hiển thị trạng thái không còn hợp lệ.

### Acceptance Criteria

- Chỉ admin có quyền mới được thu hồi.
- Bắt buộc nhập lý do thu hồi.
- Hệ thống gọi smart contract revoke.
- Cập nhật trạng thái Revoked.
- Public credential page hiển thị rõ đã thu hồi.
- Audit log ghi lại người thực hiện.

### Priority

Must-have.

---

## 7.19. IPFS/Blockchain Monitor

### Route

```txt
/admin/blockchain
```

### Mục tiêu

Theo dõi tình trạng kỹ thuật IPFS và blockchain.

### Thành phần giao diện

- Network.
- Contract address.
- Admin wallet.
- Tổng transaction.
- Tổng CID.
- Trạng thái kết nối RPC.
- Trạng thái IPFS gateway.
- Danh sách transaction.
- Danh sách IPFS CID.
- Nút verify lại hash.
- Nút retry lỗi.

### Cột bảng transaction

```txt
Thời gian | Mã bằng | Action | Tx Hash | Block | Gas Used | Status
```

### User Story

**US-ADMIN-CHAIN-01**

Là admin trường, tôi muốn xem trạng thái kết nối blockchain và IPFS để biết hệ thống có đang hoạt động ổn định không.

### Acceptance Criteria

- Hiển thị network hiện tại.
- Hiển thị contract address.
- Hiển thị wallet address.
- Hiển thị trạng thái RPC/IPFS.
- Hiển thị giao dịch gần đây.

### User Story

**US-ADMIN-CHAIN-02**

Là admin trường, tôi muốn retry các giao dịch lỗi để hoàn tất quá trình cấp bằng.

### Acceptance Criteria

- Danh sách giao dịch lỗi được hiển thị.
- Có nút retry.
- Sau retry thành công, trạng thái được cập nhật.
- Lỗi retry được ghi log.

### Priority

Should-have.

---

## 7.20. Quản lý người dùng nội bộ

### Route

```txt
/admin/users
```

### Mục tiêu

Phân quyền người dùng trong trường.

### Vai trò nội bộ

- University Admin.
- Credential Manager.
- Template Designer.
- Auditor.

### Thành phần giao diện

- Danh sách user.
- Thêm user.
- Gán role.
- Khóa/mở khóa.
- Reset mật khẩu.
- Lịch sử hoạt động.

### User Story

**US-ADMIN-USER-01**

Là admin trường, tôi muốn tạo tài khoản nhân sự nội bộ và gán quyền để kiểm soát ai được cấp bằng, ai được xem log.

### Acceptance Criteria

- Tạo được user mới.
- Gán được role.
- Role quyết định menu và hành động được phép.
- Có thể khóa tài khoản.
- Có audit log khi thay đổi quyền.

### Priority

Should-have.

---

## 7.21. Audit Logs

### Route

```txt
/admin/audit-logs
```

### Mục tiêu

Ghi nhận toàn bộ thao tác quan trọng để phục vụ kiểm tra và chống gian lận.

### Log cần có

- Tạo sinh viên.
- Sửa sinh viên.
- Tạo văn bằng.
- Cấp bằng.
- Upload IPFS.
- Ghi blockchain.
- Thu hồi.
- Đăng nhập.
- Xác minh.
- Đổi quyền người dùng.

### Cột bảng

```txt
Thời gian | Người thực hiện | Hành động | Đối tượng | IP | Kết quả | Chi tiết
```

### User Story

**US-ADMIN-AUDIT-01**

Là auditor, tôi muốn xem lịch sử thao tác để kiểm tra ai đã tạo, cấp hoặc thu hồi văn bằng.

### Acceptance Criteria

- Hiển thị log theo thời gian.
- Có filter theo hành động.
- Có filter theo người thực hiện.
- Có search theo mã văn bằng.
- Log không được sửa/xóa bởi user thường.

### Priority

Must-have.

---

## 7.22. Cài đặt tổ chức

### Route

```txt
/admin/settings
```

### Tab cần có

1. Thông tin trường.
2. Logo và thương hiệu.
3. Chữ ký số.
4. Wallet blockchain.
5. IPFS provider.
6. Email template.
7. QR/Verification domain.
8. Security.

### User Story

**US-ADMIN-SETTING-01**

Là admin trường, tôi muốn cấu hình thông tin tổ chức để văn bằng hiển thị đúng thương hiệu của trường.

### Acceptance Criteria

- Cập nhật được tên trường.
- Upload được logo.
- Cập nhật địa chỉ.
- Cập nhật người đại diện.
- Thông tin được dùng trong template bằng.

### User Story

**US-ADMIN-SETTING-02**

Là admin trường, tôi muốn cấu hình ví blockchain và IPFS provider để hệ thống có thể cấp bằng số.

### Acceptance Criteria

- Lưu được network.
- Lưu được contract address.
- Lưu được wallet public address.
- Cấu hình IPFS provider.
- Có nút test connection.

### Priority

Should-have.

---

# PHẦN D — STUDENT SITE

---

## 7.23. Student Layout

### Route cha

```txt
/student/*
```

### Sidebar

```txt
Tổng quan
Văn bằng của tôi
Ví văn bằng
Chia sẻ
Hồ sơ cá nhân
Hỗ trợ
```

### User Story

**US-STUDENT-LAYOUT-01**

Là sinh viên, tôi muốn có giao diện đơn giản để truy cập nhanh văn bằng của mình.

### Acceptance Criteria

- Sidebar dễ hiểu.
- Có avatar/tên sinh viên.
- Có responsive mobile.
- Chỉ hiển thị chức năng của sinh viên.

### Priority

Must-have.

---

## 7.24. Student Dashboard

### Route

```txt
/student/dashboard
```

### Thành phần giao diện

- Card tổng số văn bằng.
- Card số văn bằng hợp lệ.
- Card số lượt xem/xác minh.
- Bằng mới nhất.
- Nút chia sẻ nhanh.
- Thông báo từ trường.

### User Story

**US-STUDENT-01**

Là sinh viên, tôi muốn xem tổng quan văn bằng của mình sau khi đăng nhập.

### Acceptance Criteria

- Hiển thị số văn bằng.
- Hiển thị trạng thái mới nhất.
- Có link tới danh sách văn bằng.
- Có thông báo nếu có bằng mới.

### Priority

Must-have.

---

## 7.25. Văn bằng của tôi

### Route

```txt
/student/credentials
```

### Thành phần giao diện

- Danh sách card văn bằng.
- Filter theo loại bằng.
- Search theo tên văn bằng.
- Badge trạng thái.
- Nút xem chi tiết.
- Nút tải PDF.
- Nút chia sẻ.
- Nút QR.

### Card văn bằng

```txt
[Preview]
Tên văn bằng
Trường cấp
Ngày cấp
Trạng thái
[Xem] [Tải PDF] [Chia sẻ] [QR]
```

### User Story

**US-STUDENT-CREDENTIAL-01**

Là sinh viên, tôi muốn xem tất cả văn bằng của mình để tải xuống hoặc chia sẻ khi cần.

### Acceptance Criteria

- Hiển thị danh sách văn bằng thuộc sinh viên đang đăng nhập.
- Không xem được văn bằng của người khác.
- Có nút xem chi tiết.
- Có nút tải PDF.
- Có trạng thái verified/revoked.

### Priority

Must-have.

---

## 7.26. Chi tiết văn bằng sinh viên

### Route

```txt
/student/credentials/:id
```

### Thành phần giao diện

- Preview PDF.
- Thông tin văn bằng.
- QR code.
- Public verification link.
- Blockchain info.
- IPFS info.
- Lịch sử xác minh, nếu cho phép.
- Nút tải PDF.
- Nút copy link.
- Nút chia sẻ email.
- Nút chia sẻ LinkedIn.
- Nút tải QR.

### User Story

**US-STUDENT-CREDENTIAL-02**

Là sinh viên, tôi muốn xem chi tiết văn bằng để lấy QR/link gửi cho nhà tuyển dụng.

### Acceptance Criteria

- Xem được preview.
- Copy được public link.
- Tải được PDF.
- Tải được QR code.
- Link public mở được không cần đăng nhập.
- Nếu bằng bị thu hồi, hiển thị cảnh báo.

### Priority

Must-have.

---

## 7.27. Ví văn bằng

### Route

```txt
/student/wallet
```

### Mục tiêu

Tạo cảm giác đây là nơi lưu trữ credential cá nhân.

### Thành phần giao diện

- Tất cả bằng/chứng chỉ dạng card.
- Nhóm theo loại:
  - Bằng đại học.
  - Chứng chỉ.
  - Chứng nhận khóa học.
- Trạng thái verified/revoked.
- Tùy chọn kết nối ví blockchain, nếu làm nâng cao.

### User Story

**US-STUDENT-WALLET-01**

Là sinh viên, tôi muốn có ví văn bằng số để quản lý toàn bộ chứng chỉ/bằng cấp của mình.

### Acceptance Criteria

- Hiển thị tất cả credential của sinh viên.
- Có filter theo loại.
- Có trạng thái xác minh.
- Có link chia sẻ nhanh.

### Priority

Could-have.

---

## 7.28. Chia sẻ văn bằng

### Route

```txt
/student/share
```

### Thành phần giao diện

- Chọn văn bằng.
- Chọn thông tin công khai:
  - Hiện/ẩn mã sinh viên.
  - Hiện/ẩn GPA.
  - Hiện/ẩn ngày sinh.
- Tạo link chia sẻ.
- Tạo QR.
- Xem lịch sử chia sẻ.
- Thu hồi link chia sẻ, nếu có cơ chế riêng.

### User Story

**US-STUDENT-SHARE-01**

Là sinh viên, tôi muốn chia sẻ văn bằng bằng link hoặc QR cho nhà tuyển dụng.

### Acceptance Criteria

- Chọn được văn bằng.
- Tạo được public link.
- Copy được link.
- Tải được QR.
- Link dẫn tới trang public credential.

### User Story

**US-STUDENT-SHARE-02**

Là sinh viên, tôi muốn kiểm soát thông tin nào được hiển thị công khai để bảo vệ quyền riêng tư.

### Acceptance Criteria

- Có lựa chọn ẩn/hiện một số trường.
- Public page chỉ hiển thị trường được phép.
- Thay đổi quyền hiển thị có hiệu lực ngay.
- Không được ẩn các trường bắt buộc để xác minh như mã văn bằng, đơn vị cấp, trạng thái.

### Priority

Should-have.

---

## 7.29. Hồ sơ cá nhân sinh viên

### Route

```txt
/student/profile
```

### Thành phần giao diện

- Họ tên.
- Email.
- Mã sinh viên.
- Khoa.
- Ngành.
- Khóa.
- Avatar.
- Đổi mật khẩu.
- Lịch sử đăng nhập.

### User Story

**US-STUDENT-PROFILE-01**

Là sinh viên, tôi muốn xem và cập nhật một số thông tin cá nhân của mình.

### Acceptance Criteria

- Xem được thông tin cá nhân.
- Có thể cập nhật avatar/số điện thoại nếu cho phép.
- Không tự sửa được mã sinh viên, tên chính thức, ngành nếu đã xác thực.
- Có thể đổi mật khẩu.

### Priority

Could-have.

---

# PHẦN E — EMPLOYER SITE

---

## 7.30. Employer Layout

### Route cha

```txt
/employer/*
```

### Sidebar

```txt
Dashboard
Xác minh văn bằng
Lịch sử xác minh
Ứng viên đã lưu
Báo cáo
Tài khoản
```

### User Story

**US-EMPLOYER-LAYOUT-01**

Là nhà tuyển dụng, tôi muốn có giao diện riêng để xác minh và quản lý lịch sử kiểm tra văn bằng.

### Acceptance Criteria

- Sidebar hiển thị đúng chức năng employer.
- Có avatar/tên công ty.
- Có menu xác minh nổi bật.
- Responsive.

### Priority

Should-have.

---

## 7.31. Employer Dashboard

### Route

```txt
/employer/dashboard
```

### Thành phần giao diện

- Tổng số lượt xác minh.
- Số văn bằng hợp lệ.
- Số văn bằng không hợp lệ.
- Số văn bằng bị thu hồi.
- Ứng viên đã lưu.
- Xác minh gần đây.

### User Story

**US-EMPLOYER-01**

Là nhà tuyển dụng, tôi muốn xem tổng quan các lần xác minh để phục vụ quy trình tuyển dụng.

### Acceptance Criteria

- Hiển thị thống kê xác minh.
- Hiển thị lịch sử gần đây.
- Có nút xác minh mới.
- Dữ liệu chỉ thuộc tài khoản employer hiện tại.

### Priority

Should-have.

---

## 7.32. Xác minh văn bằng trong employer portal

### Route

```txt
/employer/verify
```

### Chức năng

- Nhập mã văn bằng.
- Quét QR.
- Upload PDF.
- Xem kết quả.
- Lưu ứng viên.
- Xuất báo cáo xác minh.

### User Story

**US-EMPLOYER-VERIFY-01**

Là nhà tuyển dụng, tôi muốn nhập mã văn bằng để xác minh ứng viên trong hệ thống.

### Acceptance Criteria

- Nhập mã và xác minh được.
- Kết quả hiển thị rõ ràng.
- Có trạng thái hợp lệ/không hợp lệ/đã thu hồi.
- Có thể lưu kết quả vào lịch sử.
- Có thể lưu ứng viên.

### User Story

**US-EMPLOYER-VERIFY-02**

Là nhà tuyển dụng, tôi muốn upload PDF văn bằng để kiểm tra file có đúng bản đã được cấp không.

### Acceptance Criteria

- Upload được PDF.
- Hệ thống tạo hash.
- So sánh hash với dữ liệu lưu.
- Hiển thị khớp/không khớp.
- Có cảnh báo nếu file bị chỉnh sửa.

### User Story

**US-EMPLOYER-VERIFY-03**

Là nhà tuyển dụng, tôi muốn xuất báo cáo xác minh để lưu vào hồ sơ tuyển dụng.

### Acceptance Criteria

- Có nút export PDF.
- Báo cáo chứa thông tin văn bằng.
- Báo cáo chứa thời gian xác minh.
- Báo cáo chứa kết quả xác minh.
- Báo cáo chứa transaction hash/CID nếu có.

### Priority

Must-have với xác minh; Should-have với export.

---

## 7.33. Lịch sử xác minh

### Route

```txt
/employer/history
```

### Thành phần giao diện

- Bảng lịch sử.
- Filter theo kết quả.
- Search theo ứng viên/mã bằng.
- Xem lại kết quả.
- Xuất báo cáo.

### Cột bảng

```txt
Thời gian | Mã bằng | Ứng viên | Trường cấp | Kết quả | Hành động
```

### User Story

**US-EMPLOYER-HISTORY-01**

Là nhà tuyển dụng, tôi muốn xem lịch sử các văn bằng đã xác minh để phục vụ tuyển dụng.

### Acceptance Criteria

- Hiển thị lịch sử xác minh.
- Có filter.
- Có search.
- Có xem lại chi tiết.
- Có export.

### Priority

Should-have.

---

## 7.34. Ứng viên đã lưu

### Route

```txt
/employer/candidates
```

### Thành phần giao diện

- Danh sách ứng viên.
- Văn bằng đã xác minh.
- Ghi chú nội bộ.
- Trạng thái tuyển dụng.
- Link báo cáo xác minh.

### User Story

**US-EMPLOYER-CANDIDATE-01**

Là nhà tuyển dụng, tôi muốn lưu ứng viên sau khi xác minh văn bằng để theo dõi trong quy trình tuyển dụng.

### Acceptance Criteria

- Lưu được ứng viên từ kết quả xác minh.
- Thêm được ghi chú.
- Gắn trạng thái tuyển dụng.
- Xem lại văn bằng của ứng viên.

### Priority

Could-have.

---

# 8. User Story tổng hợp theo Epic

---

## Epic 1: Authentication & Authorization

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-AUTH-01 | Đăng nhập và redirect theo role | Tất cả | Must |
| US-AUTH-02 | Đăng ký tài khoản employer | Employer | Should |
| US-AUTH-03 | Quên mật khẩu | Tất cả | Could |
| US-AUTH-04 | Phân quyền menu theo role | Tất cả | Must |
| US-AUTH-05 | Logout | Tất cả | Must |

---

## Epic 2: Public Verification

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-PUBLIC-02 | Xác minh bằng mã văn bằng | Public/Employer | Must |
| US-PUBLIC-03 | Xác minh bằng QR code | Public/Employer | Must |
| US-PUBLIC-04 | Xác minh bằng upload PDF | Public/Employer | Should |
| US-PUBLIC-05 | Xem public credential detail | Public/Employer | Must |
| US-PUBLIC-06 | Xem so sánh giải pháp | Hội đồng | Should |

---

## Epic 3: Student Management

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-ADMIN-STUDENT-01 | Xem danh sách sinh viên | Admin | Must |
| US-ADMIN-STUDENT-02 | Thêm sinh viên | Admin | Must |
| US-ADMIN-STUDENT-03 | Import sinh viên Excel/CSV | Admin | Should |
| US-ADMIN-STUDENT-04 | Xem chi tiết sinh viên | Admin | Must |
| US-ADMIN-STUDENT-05 | Cập nhật thông tin sinh viên | Admin | Should |
| US-ADMIN-STUDENT-06 | Khóa tài khoản sinh viên | Admin | Could |

---

## Epic 4: Credential Issuing

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-ADMIN-CREDENTIAL-01 | Xem danh sách văn bằng | Admin | Must |
| US-ADMIN-CREDENTIAL-02 | Lọc văn bằng theo trạng thái | Admin | Must |
| US-ADMIN-ISSUE-01 | Chọn sinh viên để cấp bằng | Admin | Must |
| US-ADMIN-ISSUE-02 | Nhập thông tin văn bằng | Admin | Must |
| US-ADMIN-ISSUE-03 | Chọn template và preview | Admin | Must |
| US-ADMIN-ISSUE-04 | Tạo hash và upload IPFS | Admin | Must |
| US-ADMIN-ISSUE-05 | Ghi blockchain | Admin | Must |
| US-ADMIN-CREDENTIAL-03 | Xem chi tiết văn bằng | Admin | Must |
| US-ADMIN-REVOKE-01 | Thu hồi văn bằng | Admin | Must |

---

## Epic 5: Template Management

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-ADMIN-TEMPLATE-01 | Xem danh sách template | Admin/Designer | Must |
| US-ADMIN-TEMPLATE-02 | Thiết kế template kéo thả | Designer | Should |
| US-ADMIN-TEMPLATE-03 | Gắn QR vào template | Designer | Must |
| US-ADMIN-TEMPLATE-04 | Preview bằng với dữ liệu mẫu | Designer | Must |
| US-ADMIN-TEMPLATE-05 | Nhân bản template | Designer | Could |

---

## Epic 6: Batch Issuing

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-ADMIN-BATCH-01 | Upload Excel cấp hàng loạt | Admin | Should |
| US-ADMIN-BATCH-02 | Theo dõi tiến trình cấp hàng loạt | Admin | Should |
| US-ADMIN-BATCH-03 | Retry dòng lỗi | Admin | Could |
| US-ADMIN-BATCH-04 | Export kết quả batch | Admin | Could |

---

## Epic 7: Student Portal

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-STUDENT-01 | Xem dashboard sinh viên | Student | Must |
| US-STUDENT-CREDENTIAL-01 | Xem danh sách văn bằng của tôi | Student | Must |
| US-STUDENT-CREDENTIAL-02 | Xem chi tiết, tải PDF, lấy QR | Student | Must |
| US-STUDENT-WALLET-01 | Quản lý ví văn bằng | Student | Could |
| US-STUDENT-SHARE-01 | Chia sẻ bằng bằng link/QR | Student | Must |
| US-STUDENT-SHARE-02 | Kiểm soát thông tin công khai | Student | Should |
| US-STUDENT-PROFILE-01 | Cập nhật hồ sơ | Student | Could |

---

## Epic 8: Employer Portal

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-EMPLOYER-01 | Xem dashboard xác minh | Employer | Should |
| US-EMPLOYER-VERIFY-01 | Xác minh bằng mã | Employer | Must |
| US-EMPLOYER-VERIFY-02 | Xác minh bằng PDF | Employer | Should |
| US-EMPLOYER-VERIFY-03 | Xuất báo cáo xác minh | Employer | Should |
| US-EMPLOYER-HISTORY-01 | Xem lịch sử xác minh | Employer | Should |
| US-EMPLOYER-CANDIDATE-01 | Lưu ứng viên | Employer | Could |

---

## Epic 9: Blockchain & IPFS

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-ADMIN-CHAIN-01 | Xem trạng thái IPFS/blockchain | Admin | Should |
| US-ADMIN-CHAIN-02 | Retry giao dịch lỗi | Admin | Should |
| US-CHAIN-03 | Verify hash giữa DB, IPFS và blockchain | Admin | Must |
| US-CHAIN-04 | Xem transaction explorer | Admin/Public | Must |
| US-CHAIN-05 | Ghi trạng thái revoke lên contract | Admin | Must |

---

## Epic 10: Audit & Security

| ID | User Story | Role | Priority |
|---|---|---|---|
| US-ADMIN-AUDIT-01 | Xem audit logs | Auditor/Admin | Must |
| US-SECURITY-01 | Phân quyền theo role | Tất cả | Must |
| US-SECURITY-02 | Chỉ issuer được cấp/thu hồi | Admin | Must |
| US-SECURITY-03 | Không cho sửa văn bằng đã on-chain | Admin | Must |
| US-SECURITY-04 | Ghi log thao tác nhạy cảm | Admin/Auditor | Must |

---

# 9. Luồng nghiệp vụ chính

---

## 9.1. Luồng cấp bằng đơn lẻ

```txt
Admin đăng nhập
→ Vào Cấp bằng
→ Chọn sinh viên
→ Nhập thông tin văn bằng
→ Chọn template
→ Preview PDF
→ Tạo hash
→ Upload IPFS
→ Nhận CID
→ Ghi blockchain
→ Lưu transaction hash
→ Sinh viên thấy bằng trong portal
→ Nhà tuyển dụng có thể xác minh bằng QR/link
```

## 9.2. Luồng xác minh bằng QR

```txt
Nhà tuyển dụng quét QR
→ Mở public credential page
→ Hệ thống đọc credentialId
→ Lấy dữ liệu DB
→ Kiểm tra trạng thái smart contract
→ So sánh hash/CID
→ Hiển thị hợp lệ/không hợp lệ/đã thu hồi
```

## 9.3. Luồng xác minh bằng file PDF

```txt
Nhà tuyển dụng upload PDF
→ Hệ thống tạo SHA-256 hash
→ Tìm hash trong database/blockchain
→ Nếu khớp: hiển thị thông tin văn bằng
→ Nếu không khớp: cảnh báo file không hợp lệ
```

## 9.4. Luồng thu hồi văn bằng

```txt
Admin tìm văn bằng
→ Xem chi tiết
→ Chọn thu hồi
→ Nhập lý do
→ Gọi smart contract revoke
→ Cập nhật DB
→ Public page hiển thị Revoked
→ Audit log ghi nhận
```

---

# 10. Dữ liệu cần hiển thị trên giao diện

## 10.1. Student

```json
{
  "id": "stu_001",
  "studentCode": "SV2026001",
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "faculty": "Cong nghe thong tin",
  "major": "Ky thuat phan mem",
  "course": "K20",
  "status": "ACTIVE"
}
```

## 10.2. Credential

```json
{
  "id": "cred_001",
  "credentialCode": "VD-2026-000001",
  "studentId": "stu_001",
  "title": "Bang cu nhan Cong nghe thong tin",
  "type": "BACHELOR_DEGREE",
  "major": "Ky thuat phan mem",
  "classification": "Gioi",
  "issueDate": "2026-06-20",
  "serialNumber": "A123456",
  "registryNumber": "2026/001",
  "status": "ISSUED",
  "pdfHash": "0x...",
  "metadataHash": "0x...",
  "ipfsCid": "bafy...",
  "transactionHash": "0x...",
  "contractAddress": "0x...",
  "network": "Sepolia"
}
```

## 10.3. Verification Result

```json
{
  "credentialCode": "VD-2026-000001",
  "status": "VALID",
  "message": "Van bang hop le",
  "verifiedAt": "2026-06-20T10:00:00Z",
  "issuer": "Dai hoc ABC",
  "studentName": "Nguyen Van A",
  "credentialTitle": "Bang cu nhan Cong nghe thong tin",
  "ipfsCid": "bafy...",
  "transactionHash": "0x..."
}
```

---

# 11. Gợi ý React Frontend

## 11.1. Công nghệ đề xuất

- React + Vite.
- React Router DOM.
- Tailwind CSS.
- shadcn/ui hoặc MUI.
- React Hook Form.
- Zod.
- Axios.
- Zustand hoặc Redux Toolkit.
- ethers.js hoặc wagmi.
- qrcode.react.
- html2canvas hoặc react-pdf.
- date-fns.
- lucide-react.

## 11.2. Cấu trúc thư mục

```txt
src/
  app/
    router.jsx
    providers.jsx
    store.js

  layouts/
    PublicLayout.jsx
    AuthLayout.jsx
    AdminLayout.jsx
    StudentLayout.jsx
    EmployerLayout.jsx

  pages/
    public/
      Home.jsx
      VerifyPublic.jsx
      PublicCredential.jsx
      Comparison.jsx

    auth/
      Login.jsx
      RegisterEmployer.jsx
      ForgotPassword.jsx

    admin/
      Dashboard.jsx
      Students.jsx
      StudentDetail.jsx
      Credentials.jsx
      CredentialCreate.jsx
      CredentialDetail.jsx
      Templates.jsx
      TemplateEditor.jsx
      Batches.jsx
      BatchDetail.jsx
      Revocations.jsx
      BlockchainMonitor.jsx
      Users.jsx
      AuditLogs.jsx
      Settings.jsx

    student/
      StudentDashboard.jsx
      MyCredentials.jsx
      MyCredentialDetail.jsx
      Wallet.jsx
      ShareCredential.jsx
      StudentProfile.jsx

    employer/
      EmployerDashboard.jsx
      EmployerVerify.jsx
      VerificationHistory.jsx
      Candidates.jsx
      Reports.jsx
      EmployerProfile.jsx

  components/
    common/
      AppHeader.jsx
      Sidebar.jsx
      StatCard.jsx
      DataTable.jsx
      StatusBadge.jsx
      EmptyState.jsx
      LoadingState.jsx
      ConfirmDialog.jsx
      SearchInput.jsx

    credential/
      CredentialCard.jsx
      CredentialPreview.jsx
      VerificationResult.jsx
      BlockchainInfo.jsx
      IPFSInfo.jsx
      QRCodeBox.jsx

    admin/
      IssueCredentialWizard.jsx
      StudentForm.jsx
      CredentialForm.jsx
      BatchImport.jsx

    template/
      TemplateCanvas.jsx
      FieldToolbar.jsx
      PropertyPanel.jsx
      DynamicFieldPicker.jsx

  services/
    api.js
    auth.service.js
    student.service.js
    credential.service.js
    template.service.js
    verification.service.js
    ipfs.service.js
    blockchain.service.js
    audit.service.js

  hooks/
    useAuth.js
    useRole.js
    useStudents.js
    useCredentials.js
    useVerification.js

  utils/
    constants.js
    formatDate.js
    hashFile.js
    permissions.js
    routes.js
```

## 11.3. Route mẫu

```jsx
import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import StudentLayout from "@/layouts/StudentLayout";
import EmployerLayout from "@/layouts/EmployerLayout";

import Home from "@/pages/public/Home";
import VerifyPublic from "@/pages/public/VerifyPublic";
import PublicCredential from "@/pages/public/PublicCredential";

import Login from "@/pages/auth/Login";

import AdminDashboard from "@/pages/admin/Dashboard";
import Students from "@/pages/admin/Students";
import StudentDetail from "@/pages/admin/StudentDetail";
import Credentials from "@/pages/admin/Credentials";
import CredentialCreate from "@/pages/admin/CredentialCreate";
import CredentialDetail from "@/pages/admin/CredentialDetail";
import Templates from "@/pages/admin/Templates";
import TemplateEditor from "@/pages/admin/TemplateEditor";
import BlockchainMonitor from "@/pages/admin/BlockchainMonitor";

import StudentDashboard from "@/pages/student/StudentDashboard";
import MyCredentials from "@/pages/student/MyCredentials";
import MyCredentialDetail from "@/pages/student/MyCredentialDetail";

import EmployerDashboard from "@/pages/employer/EmployerDashboard";
import EmployerVerify from "@/pages/employer/EmployerVerify";
import VerificationHistory from "@/pages/employer/VerificationHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "verify", element: <VerifyPublic /> },
      { path: "credential/:credentialId", element: <PublicCredential /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "students", element: <Students /> },
      { path: "students/:id", element: <StudentDetail /> },
      { path: "credentials", element: <Credentials /> },
      { path: "credentials/create", element: <CredentialCreate /> },
      { path: "credentials/:id", element: <CredentialDetail /> },
      { path: "templates", element: <Templates /> },
      { path: "templates/create", element: <TemplateEditor /> },
      { path: "templates/:id/edit", element: <TemplateEditor /> },
      { path: "blockchain", element: <BlockchainMonitor /> },
    ],
  },
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "credentials", element: <MyCredentials /> },
      { path: "credentials/:id", element: <MyCredentialDetail /> },
    ],
  },
  {
    path: "/employer",
    element: <EmployerLayout />,
    children: [
      { path: "dashboard", element: <EmployerDashboard /> },
      { path: "verify", element: <EmployerVerify /> },
      { path: "history", element: <VerificationHistory /> },
    ],
  },
]);
```

---

# 12. Phân quyền giao diện

## 12.1. Permission matrix

| Chức năng | Admin | Credential Manager | Designer | Auditor | Student | Employer |
|---|---:|---:|---:|---:|---:|---:|
| Xem dashboard admin | Có | Có | Không | Có | Không | Không |
| Quản lý sinh viên | Có | Có | Không | Chỉ xem | Không | Không |
| Tạo văn bằng | Có | Có | Không | Không | Không | Không |
| Ghi blockchain | Có | Có nếu được cấp quyền | Không | Không | Không | Không |
| Thu hồi văn bằng | Có | Không/Có giới hạn | Không | Không | Không | Không |
| Thiết kế template | Có | Không | Có | Không | Không | Không |
| Xem audit log | Có | Không | Không | Có | Không | Không |
| Xem bằng cá nhân | Không | Không | Không | Không | Có | Không |
| Xác minh public | Có | Có | Có | Có | Có | Có |
| Lưu lịch sử xác minh | Không | Không | Không | Không | Không | Có |

---

# 13. Màn hình MVP nên làm trước

Nếu thời gian làm đồ án có hạn, nên ưu tiên các màn hình sau:

## 13.1. Nhóm Public

1. Home.
2. Public Verify.
3. Public Credential Detail.
4. Login.

## 13.2. Nhóm Admin

5. Admin Dashboard.
6. Student List.
7. Student Detail.
8. Credential List.
9. Create Credential Wizard.
10. Credential Detail.
11. Template List.
12. Template Editor đơn giản.
13. Revocation.
14. Blockchain/IPFS Monitor.
15. Audit Logs.

## 13.3. Nhóm Student

16. Student Dashboard.
17. My Credentials.
18. My Credential Detail.

## 13.4. Nhóm Employer

19. Employer Verify.
20. Verification History.

Tổng cộng 20 màn hình là đủ mạnh cho đồ án.

---

# 14. Phân kỳ triển khai

## Phase 1: Nền tảng giao diện

- Setup React + Vite.
- Setup Tailwind.
- Setup router.
- Tạo layout public/admin/student/employer.
- Tạo login fake role.
- Tạo sidebar theo role.

## Phase 2: Admin cơ bản

- Student list.
- Student form.
- Credential list.
- Credential detail.
- Create credential wizard UI.

## Phase 3: Template và PDF

- Template list.
- Template preview.
- Gắn dynamic fields.
- Gắn QR code.
- Export PDF.

## Phase 4: IPFS và Blockchain

- Tạo hash.
- Upload IPFS.
- Gọi smart contract.
- Lưu CID/transaction hash.
- Verify on-chain.

## Phase 5: Public verification

- Public verify by code.
- Public credential page.
- QR scan.
- Upload PDF verify hash.

## Phase 6: Student/Employer portal

- Student dashboard.
- My credentials.
- Share credential.
- Employer verify.
- Employer history.

## Phase 7: Hoàn thiện báo cáo

- So sánh truyền thống vs blockchain/IPFS.
- Test case.
- Screenshot giao diện.
- Demo flow.
- Viết kết luận.

---

# 15. Test case giao diện quan trọng

## 15.1. Test cấp bằng thành công

| Bước | Kết quả mong muốn |
|---|---|
| Admin chọn sinh viên | Sinh viên được chọn |
| Nhập thông tin bằng | Validate thành công |
| Chọn template | Preview hiển thị đúng |
| Tạo hash | Hash được tạo |
| Upload IPFS | Có CID |
| Ghi blockchain | Có transaction hash |
| Xem public page | Trạng thái hợp lệ |

## 15.2. Test xác minh mã sai

| Bước | Kết quả mong muốn |
|---|---|
| Nhập mã không tồn tại | Hiển thị không tìm thấy |
| Không có thông tin cá nhân | Đúng |
| Có hướng dẫn liên hệ | Đúng |

## 15.3. Test file PDF bị sửa

| Bước | Kết quả mong muốn |
|---|---|
| Upload PDF đã chỉnh sửa | Hash không khớp |
| Hiển thị cảnh báo | Đúng |
| Không hiện trạng thái hợp lệ | Đúng |

## 15.4. Test thu hồi văn bằng

| Bước | Kết quả mong muốn |
|---|---|
| Admin nhập lý do thu hồi | Form hợp lệ |
| Gọi revoke contract | Thành công |
| Public page | Hiển thị Revoked |
| Verify lại | Kết quả đã thu hồi |

---

# 16. Rủi ro và hướng xử lý

## 16.1. Rủi ro lộ private key

### Vấn đề

Nếu private key của trường bị lộ, người khác có thể giả mạo quyền cấp bằng.

### Hướng xử lý

- Không lưu private key plaintext.
- Dùng ví trình duyệt như MetaMask cho demo.
- Backend chỉ lưu public address.
- Smart contract phân quyền issuer.
- Có cơ chế rotate issuer address.

## 16.2. Rủi ro IPFS file không truy cập được

### Vấn đề

IPFS cần pinning để file luôn còn khả dụng.

### Hướng xử lý

- Dùng pinning service.
- Lưu thêm bản backup trong server.
- Public page kiểm tra gateway fallback.
- Monitor trạng thái pin.

## 16.3. Rủi ro dữ liệu cá nhân công khai quá nhiều

### Vấn đề

Văn bằng chứa thông tin cá nhân, nếu public toàn bộ có thể ảnh hưởng riêng tư.

### Hướng xử lý

- Public page chỉ hiển thị thông tin cần xác minh.
- Cho sinh viên cấu hình thông tin chia sẻ.
- Không public ngày sinh, địa chỉ, CCCD.
- Có link chia sẻ giới hạn nếu muốn nâng cao.

## 16.4. Rủi ro chi phí gas

### Vấn đề

Ghi nhiều dữ liệu lên blockchain tốn phí.

### Hướng xử lý

- Chỉ ghi hash/CID, không ghi toàn bộ file.
- Cấp hàng loạt có thể gom batch.
- Dùng testnet cho đồ án.
- Có báo cáo so sánh chi phí.

---

# 17. Smart contract cần hỗ trợ những gì từ góc nhìn giao diện

Frontend cần các hàm cơ bản sau:

```solidity
issueCredential(
  string credentialCode,
  bytes32 credentialHash,
  string ipfsCid,
  address studentAddress
)

verifyCredential(
  string credentialCode
)

revokeCredential(
  string credentialCode,
  string reason
)

getCredential(
  string credentialCode
)

isIssuer(
  address account
)
```

## Dữ liệu contract nên trả về

```txt
credentialCode
credentialHash
ipfsCid
issuer
issuedAt
isRevoked
revokedAt
revokeReason
```

## Tác động lên UI

- Nếu `isRevoked = false` và hash khớp: hiển thị Hợp lệ.
- Nếu `isRevoked = true`: hiển thị Đã thu hồi.
- Nếu không tìm thấy: hiển thị Không tồn tại.
- Nếu hash không khớp: hiển thị Có dấu hiệu bị chỉnh sửa.

---

# 18. Gợi ý component UI

## 18.1. StatusBadge

Dùng cho trạng thái văn bằng/giao dịch.

Props:

```txt
status: Draft | Pending | Issued | Verified | Revoked | Failed
```

## 18.2. CredentialPreview

Dùng để xem bằng.

Props:

```txt
credential
template
showQRCode
```

## 18.3. VerificationResult

Dùng ở public verify và employer verify.

Props:

```txt
resultStatus
credential
blockchainInfo
ipfsInfo
```

## 18.4. BlockchainInfo

Hiển thị:

- Network.
- Contract.
- Tx hash.
- Block number.
- Gas used.

## 18.5. IPFSInfo

Hiển thị:

- CID.
- Gateway URL.
- Pin status.
- Metadata hash.

## 18.6. IssueCredentialWizard

Quản lý 5 bước cấp bằng.

State:

```txt
selectedStudent
credentialForm
selectedTemplate
pdfFile
hash
ipfsCid
txHash
currentStep
```

---

# 19. Nội dung báo cáo có thể lấy từ tài liệu này

## 19.1. Chương phân tích yêu cầu

- Vấn đề giả mạo văn bằng.
- Nhu cầu xác minh nhanh.
- Vai trò của trường, sinh viên, nhà tuyển dụng.
- Yêu cầu chức năng.
- Yêu cầu phi chức năng.

## 19.2. Chương thiết kế hệ thống

- Kiến trúc 3 module.
- Sitemap.
- User story.
- Use case.
- Luồng nghiệp vụ.
- Phân quyền.

## 19.3. Chương thiết kế giao diện

- Public site.
- Admin dashboard.
- Student portal.
- Employer portal.
- Template editor.
- Verification page.

## 19.4. Chương công nghệ

- React frontend.
- Backend API.
- IPFS.
- Smart contract.
- QR code.
- Hash SHA-256.

## 19.5. Chương đánh giá

- So sánh blockchain/IPFS với lưu trữ truyền thống.
- Ưu điểm.
- Hạn chế.
- Hướng phát triển.

---

# 20. Kết luận định hướng thiết kế

Đề tài nên được triển khai theo hướng một nền tảng SaaS cấp phát và xác minh văn bằng số. Trọng tâm không chỉ là “ghi dữ liệu lên blockchain”, mà là xây dựng một quy trình hoàn chỉnh:

```txt
Tạo văn bằng
→ Thiết kế mẫu
→ Cấp phát
→ Lưu IPFS
→ Ghi blockchain
→ Sinh viên nhận bằng
→ Nhà tuyển dụng xác minh
→ Hệ thống ghi nhận lịch sử và trạng thái
```

Các giao diện quan trọng nhất cần hoàn thành để đồ án có tính thuyết phục:

1. Admin Dashboard.
2. Student Management.
3. Credential Issuing Wizard.
4. Template Editor.
5. Public Verification.
6. Public Credential Detail.
7. Student Credential Portal.
8. Employer Verification Portal.
9. Blockchain/IPFS Monitor.
10. Audit Logs.

Nếu làm tốt các màn hình này, đề tài sẽ thể hiện được đầy đủ 4 yêu cầu chính:

- Có quy trình cấp bằng số.
- Có lưu trữ IPFS.
- Có smart contract blockchain.
- Có công cụ xác minh cho nhà tuyển dụng/người dùng.

---

# 21. Checklist cuối cùng cho nhóm phát triển

## UI/UX

- [ ] Có Public Home.
- [ ] Có Public Verify.
- [ ] Có Public Credential Page.
- [ ] Có Login.
- [ ] Có Admin Layout.
- [ ] Có Student Layout.
- [ ] Có Employer Layout.
- [ ] Có Dashboard cho Admin.
- [ ] Có danh sách sinh viên.
- [ ] Có danh sách văn bằng.
- [ ] Có wizard cấp bằng.
- [ ] Có template editor.
- [ ] Có QR code.
- [ ] Có blockchain/IPFS info.
- [ ] Có audit logs.

## Nghiệp vụ

- [ ] Admin thêm sinh viên.
- [ ] Admin tạo văn bằng.
- [ ] Admin preview bằng.
- [ ] Hệ thống tạo hash.
- [ ] Hệ thống upload IPFS.
- [ ] Hệ thống ghi blockchain.
- [ ] Sinh viên xem và chia sẻ bằng.
- [ ] Nhà tuyển dụng xác minh.
- [ ] Admin thu hồi bằng.
- [ ] Public page cập nhật trạng thái thu hồi.

## Kỹ thuật

- [ ] React Router theo role.
- [ ] Protected routes.
- [ ] Role-based permissions.
- [ ] API service layer.
- [ ] Blockchain service.
- [ ] IPFS service.
- [ ] Hash file PDF.
- [ ] QR generation.
- [ ] PDF export.
- [ ] Error handling.
- [ ] Loading states.
- [ ] Responsive design.

---

# 22. Tài liệu tham khảo gợi ý

- Sertifier — Digital Credentials and Certificates Platform.
- W3C Verifiable Credentials Data Model.
- IPFS Docs — Content Addressing and CID.
- OpenZeppelin Contracts — Access Control.
- Ethereum/Solidity documentation.
- React Router documentation.
- Tailwind CSS documentation.
- ethers.js documentation.
