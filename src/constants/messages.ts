export const MESSAGES = {
  SUCCESS: {
    ISSUED: "Văn bằng đã được cấp và ghi nhận lên blockchain thành công.",
    REVOKED: "Văn bằng đã được thu hồi thành công.",
    VERIFIED: "Văn bằng hợp lệ. Dữ liệu khớp với bản ghi trên blockchain.",
    SAVED: "Lưu thông tin thành công.",
  },
  ERROR: {
    UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này.",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
    NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
    INVALID_HASH: "Mã băm không khớp. Văn bằng có thể đã bị chỉnh sửa.",
    NETWORK: "Lỗi kết nối mạng. Vui lòng thử lại sau.",
    WALLET: "Không tìm thấy ví MetaMask. Vui lòng cài đặt hoặc kết nối ví.",
  },
};
