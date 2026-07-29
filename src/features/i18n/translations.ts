export type Locale = "vi" | "en";

export type TranslationValue = string | { [key: string]: TranslationValue } | TranslationValue[];

const translations: Record<Locale, Record<string, TranslationValue>> = {
  vi: {
    nav: {
      solutions: "Giải pháp",
      technology: "Công nghệ",
      pricing: "Bảng giá",
      verify: "Xác minh bằng",
      login: "Đăng nhập",
      register: "Đăng ký ngay",
      dashboard: "Bảng điều khiển",
      logout: "Đăng xuất",
      registerEmployer: "Đăng ký tuyển dụng",
    },
    hero: {
      badge: "Giải pháp Blockchain cho giáo dục",
      title1: "Cấp phát & xác thực",
      title2: "văn bằng số chống giả",
      desc: "CertiChain giúp các trường đại học và tổ chức giáo dục thiết kế, tự động hóa và theo dõi chứng chỉ số trên blockchain, tiết kiệm hàng giờ làm thủ công và mang lại sự hài lòng cho mọi người học.",
      cta_verify: "Xác minh ngay",
      cta_login: "Đăng nhập hệ thống",
      no_card: "Không cần thẻ tín dụng • Miễn phí cho 250 người nhận",
      stat1_label: "Chống giả mạo",
      stat2_label: "Xác minh tức thì",
      stat3_label: "Chi phí xác thực",
    },
    trusted: {
      title: "Được tin tưởng bởi các tổ chức giáo dục hàng đầu",
    },
    features: {
      badge: "Dành cho trường đại học và tổ chức giáo dục",
      title: "Triển khai chương trình cấp bằng số trong vài giờ",
      desc: "Hầu hết các đội cần IT để cấp chứng chỉ ở quy mô lớn. Với CertiChain, bạn kết nối các công cụ hiện có, đặt quy tắc và nền tảng xử lý cấp phát, chia sẻ và xác thực tự động.",
      integrations: "Tích hợp với",
      integrations_more: "và hơn 20+ hệ thống khác",
      items: [
        {
          title: "Thiết kế theo thương hiệu",
          desc: "Sử dụng mẫu bằng an toàn hoặc tạo từ đầu. Trường động, xem trước thời gian thực và các ràng buộc thương hiệu giúp mọi chứng chỉ đều nhất quán.",
          tag: "Mẫu bằng • Ràng buộc thương hiệu • Kéo thả",
        },
        {
          title: "Cấp phát ở mọi quy mô",
          desc: "Tự động hóa từ LMS, CRM hoặc dữ liệu ghi danh. Sử dụng trigger thông minh hoặc REST API để cấp 50 hay 50.000 chứng chỉ mà không cần thao tác thủ công.",
          tag: "Cấp hàng loạt • API • Trigger thông minh",
        },
        {
          title: "Bàn giao đúng thời điểm",
          desc: "Gửi ngay khi hoàn thành hoặc theo lịch với phê duyệt và tin nhắn cá nhân hóa. Người nhận nhận chứng chỉ an toàn và tức thì.",
          tag: "Email • Quy trình tự động • Lên lịch",
        },
        {
          title: "Chia sẻ thành tích",
          desc: "Chia sẻ một cú nhấp chuột lên LinkedIn, nhúng trang web và xuất PDF. Mỗi chứng chỉ đều có URL công khai mà người nhận tự hào chia sẻ.",
          tag: "LinkedIn • Chia sẻ MXH • Xuất PDF",
        },
        {
          title: "Xác thực tức thì",
          desc: "Mỗi chứng chỉ có thể xác thực qua mã QR và URL trên blockchain. Nhà tuyển dụng và đối tác xác nhận tính xác thực trong vài giây.",
          tag: "QR • Bảo mật Blockchain • Sổ công khai",
        },
        {
          title: "Đo lường tác động",
          desc: "Xem lượt xem, lượt chia sẻ và hiệu suất chương trình theo khóa học hoặc nhóm. Xuất báo cáo cho lãnh đạo và cải thiện chương trình.",
          tag: "Phân tích tương tác • Theo dõi chia sẻ • Xuất Excel",
        },
      ],
    },
    stats: {
      issued: "Chứng chỉ đã cấp phát",
      engagement: "Tăng mức độ tương tác người học",
      response: "Thời gian phản hồi onboarding",
    },
    howItWorks: {
      badge: "QUY TRÌNH 3 BƯỚC",
      title: "Công nghệ tiên tiến tạo nên sự tin cậy tuyệt đối",
      desc: "Hệ thống kết hợp hài hòa giữa Blockchain và IPFS, đảm bảo tính minh bạch, bất biến và bảo mật cao nhất cho mỗi văn bằng số.",
      step1_title: "Trường Đại học (Issuer)",
      step1_desc: "Tổ chức giáo dục khai báo danh sách tốt nghiệp, sinh tệp PDF động, ký số qua ví mật mã để xác thực quyền sở hữu.",
      step2_title: "Blockchain & IPFS",
      step2_desc: "Tệp PDF lưu phi tập trung lên IPFS nhận mã CID. Mã CID và metadata được ghi vĩnh viễn lên Blockchain tạo hồ sơ bất biến.",
      step3_title: "Nhà tuyển dụng (Verifier)",
      step3_desc: "Bên thứ ba truy cập công khai, quét mã QR, tra cứu ID hoặc tải PDF để so khớp mã băm với dữ liệu on-chain tức thì.",
    },
    testimonials: {
      badge: "KHÁCH HÀNG NÓI GÌ",
      title: "Các nhà giáo dục tin tưởng CertiChain",
    },
    integrations: {
      badge: "HỆ SINH THÁI KẾT NỐI",
      title: "Kết nối với các công cụ bạn đang sử dụng",
      desc: "Tích hợp LMS và CRM bản địa cùng REST API và webhooks. Xây dựng quy trình cấp chứng chỉ trong vài phút mà không cần bảng tính.",
      more: "20+ Tích hợp khác",
    },
    pricing: {
      badge: "BẢNG GIÁ MINH BẠCH",
      title: "Bắt đầu miễn phí, mở rộng khi sẵn sàng",
      popular: "Phổ biến nhất",
      free: {
        name: "Miễn phí",
        desc: "Bắt đầu nhanh chóng",
        price: "0",
        unit: "VNĐ/năm",
        features: ["250 người nhận/năm", "Không giới hạn chứng chỉ", "Tích hợp cơ bản"],
        cta: "Bắt đầu miễn phí",
      },
      pro: {
        name: "Pro",
        desc: "Mở rộng và xây dựng thương hiệu",
        price: "250K",
        unit: "VNĐ/năm",
        features: ["Cổng thương hiệu và email", "Phân tích nâng cao", "Hỗ trợ ưu tiên"],
        cta: "Bắt đầu dùng Pro",
      },
      enterprise: {
        name: "Doanh nghiệp",
        desc: "Tùy chỉnh cho quy mô lớn",
        price: "Liên hệ",
        unit: "",
        features: ["Cổng thương hiệu trắng", "Quản lý khách hàng riêng", "SLA và bảo mật tùy chỉnh"],
        cta: "Liên hệ ngay",
      },
      cta_tail: "Cần triển khai đa cơ sở hoặc quản lý khách hàng riêng?",
      cta_tail_link: "Liên hệ với chúng tôi",
    },
    faq: {
      badge: "HỎI ĐÁP",
      title: "Các câu hỏi thường gặp",
    },
    cta: {
      title: "Sẵn sàng nâng tầm trải nghiệm cấp bằng số?",
      desc: "Bắt đầu miễn phí hoặc liên hệ với chúng tôi để được tư vấn giải pháp phù hợp với chương trình đào tạo của bạn.",
      btn1: "Bắt đầu miễn phí",
      btn2: "Xác minh chứng chỉ",
    },
    footer: {
      tagline: "Hệ thống xác thực và cấp phát văn bằng dựa trên nền tảng Blockchain.",
      solutions: "Giải pháp",
      for_university: "Cho Trường đại học",
      for_employer: "Cho Nhà tuyển dụng",
      for_student: "Cho Sinh viên",
      features_title: "Tính năng",
      feat_certificates: "Chứng chỉ số",
      feat_verify: "Xác thực Blockchain",
      feat_analytics: "Phân tích",
      resources: "Tài nguyên",
      blog: "Blog",
      api_docs: "Tài liệu API",
      knowledge: "Kiến thức",
      company: "Công ty",
      about: "Giới thiệu",
      contact: "Liên hệ",
      security: "Bảo mật",
      copyright: "All rights reserved.",
      terms: "Điều khoản",
      privacy: "Bảo mật",
      cookie: "Cookie",
    },
    auth: {
      login_title: "Đăng nhập",
      login_subtitle: "Sử dụng tài khoản email hoặc kết nối ví",
      register_title: "Đăng ký tài khoản",
      register_subtitle: "Đăng ký để được cấp hợp đồng thông minh riêng",
      email: "Email",
      password: "Mật khẩu",
      login_btn: "Đăng nhập",
      loading: "Đang xử lý...",
      or: "Hoặc",
      metamask: "Kết nối ví MetaMask",
      no_account: "Đã có tài khoản?",
      has_account: "Chưa có tài khoản?",
      register_link: "Đăng ký tài khoản trường học",
      forgot_password: "Quên mật khẩu?",
      institution_name: "Tên trường / Học viện",
      institution_code: "Mã trường (chữ in hoa, không dấu)",
      admin_email: "Email quản trị (email trường)",
      admin_name: "Tên người quản trị",
      confirm_password: "Xác nhận mật khẩu",
      password_hint: "Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số",
      password_confirm_placeholder: "Nhập lại mật khẩu",
      submit_register: "Gửi yêu cầu đăng ký",
      institution_code_hint: "Không dùng email cá nhân (gmail, yahoo...)",
      admin_email_placeholder: "admin@truonghoc.edu.vn",
      hello: "Xin chào",
    },
  },
  en: {
    nav: {
      solutions: "Solutions",
      technology: "Technology",
      pricing: "Pricing",
      verify: "Verify Diploma",
      login: "Login",
      register: "Get Started",
      dashboard: "Dashboard",
      logout: "Logout",
      registerEmployer: "Register as Employer",
    },
    hero: {
      badge: "Blockchain Solution for Education",
      title1: "Issue & Verify",
      title2: "Fraud-Proof Digital Diplomas",
      desc: "CertiChain helps universities and educational organizations design, automate, and track digital credentials on the blockchain, saving hours of manual work while delighting every learner.",
      cta_verify: "Verify Now",
      cta_login: "Login to System",
      no_card: "No credit card required • Free for 250 recipients",
      stat1_label: "Fraud proof",
      stat2_label: "Instant verify",
      stat3_label: "Free verification",
    },
    trusted: {
      title: "Trusted by leading educational institutions",
    },
    features: {
      badge: "For universities and educational organizations",
      title: "Launch credential programs in hours, not weeks",
      desc: "Most teams need IT to issue credentials at scale. With CertiChain, you connect your existing tools, set rules, and the platform handles issuing, sharing, and verification automatically.",
      integrations: "Integrates with",
      integrations_more: "and 20+ other systems",
      items: [
        {
          title: "Design on brand",
          desc: "Use safe templates or start from scratch. Dynamic fields, real-time preview, and brand controls keep every certificate consistent.",
          tag: "Templates • Brand controls • Drag & drop",
        },
        {
          title: "Issue at any scale",
          desc: "Automate from LMS, CRM, or enrollment data. Use smart triggers or REST API to issue 50 or 50,000 credentials without manual work.",
          tag: "Bulk issuing • API • Smart triggers",
        },
        {
          title: "Deliver at the right moment",
          desc: "Instant sends on completion or scheduled batches with approvals and personalized messaging. Recipients receive credentials securely.",
          tag: "Email • Automated workflows • Scheduling",
        },
        {
          title: "Turn achievement into reach",
          desc: "One-click sharing to LinkedIn, website embeds, and PDF exports. Every credential includes a public URL recipients are proud to share.",
          tag: "LinkedIn • Social sharing • PDF export",
        },
        {
          title: "Trust on scan",
          desc: "Each credential is verifiable via QR code and blockchain-backed URL. Employers and partners confirm authenticity in seconds.",
          tag: "QR • Blockchain security • Public registry",
        },
        {
          title: "Prove the impact",
          desc: "See views, shares, and program performance by course or cohort. Export reports for leadership and improve your programs.",
          tag: "Engagement metrics • Share tracking • Excel export",
        },
      ],
    },
    stats: {
      issued: "Credentials issued",
      engagement: "Increase in learner engagement",
      response: "Onboarding response time",
    },
    howItWorks: {
      badge: "3-STEP PROCESS",
      title: "Advanced technology for absolute trust",
      desc: "The system harmoniously combines Blockchain and IPFS, ensuring transparency, immutability, and highest security for every digital diploma.",
      step1_title: "University (Issuer)",
      step1_desc: "Educational institutions declare graduation lists, generate dynamic PDF files, and sign digitally via crypto wallet to authenticate ownership.",
      step2_title: "Blockchain & IPFS",
      step2_desc: "PDF files are stored decentralized on IPFS to receive a CID hash. The CID and metadata are permanently recorded on the Blockchain, creating an immutable record.",
      step3_title: "Employer (Verifier)",
      step3_desc: "Third parties access publicly, scan QR codes, look up IDs, or upload PDFs to instantly match the hash with on-chain data.",
    },
    testimonials: {
      badge: "WHAT CUSTOMERS SAY",
      title: "Education leaders trust CertiChain",
    },
    integrations: {
      badge: "SEAMLESS ECOSYSTEM",
      title: "Connect to the tools you already trust",
      desc: "Native LMS and CRM integrations plus REST API and webhooks. Build credential workflows in minutes without spreadsheets.",
      more: "20+ Integrations",
    },
    pricing: {
      badge: "TRANSPARENT PRICING",
      title: "Start free, scale when you're ready",
      popular: "Most popular",
      free: {
        name: "Free",
        desc: "Launch quickly",
        price: "0",
        unit: "VND/year",
        features: ["250 recipients/year", "Unlimited credentials", "Core integrations"],
        cta: "Start for free",
      },
      pro: {
        name: "Pro",
        desc: "Scale and brand",
        price: "250K",
        unit: "VND/year",
        features: ["Branded portal and email", "Advanced analytics", "Priority support"],
        cta: "Start Pro",
      },
      enterprise: {
        name: "Enterprise",
        desc: "Tailored for scale",
        price: "Contact",
        unit: "",
        features: ["White-label portal", "Dedicated CSM", "Custom SLAs and security"],
        cta: "Contact us",
      },
      cta_tail: "Need multi-campus rollout or a dedicated CSM?",
      cta_tail_link: "Talk to us",
    },
    faq: {
      badge: "FAQ",
      title: "Frequently asked questions",
    },
    cta: {
      title: "Ready to elevate your credential experience?",
      desc: "Start for free or meet with our specialists to tailor a solution for your programs.",
      btn1: "Start for free",
      btn2: "Verify a credential",
    },
    footer: {
      tagline: "Blockchain-based certificate issuance and verification system.",
      solutions: "Solutions",
      for_university: "For Universities",
      for_employer: "For Employers",
      for_student: "For Students",
      features_title: "Features",
      feat_certificates: "Digital Certificates",
      feat_verify: "Blockchain Verification",
      feat_analytics: "Analytics",
      resources: "Resources",
      blog: "Blog",
      api_docs: "API Docs",
      knowledge: "Knowledge Base",
      company: "Company",
      about: "About",
      contact: "Contact",
      security: "Security",
      copyright: "All rights reserved.",
      terms: "Terms",
      privacy: "Privacy",
      cookie: "Cookie",
    },
    auth: {
      login_title: "Login",
      login_subtitle: "Use email account or connect wallet",
      register_title: "Register Account",
      register_subtitle: "Register to get your own smart contract",
      email: "Email",
      password: "Password",
      login_btn: "Login",
      loading: "Processing...",
      or: "Or",
      metamask: "Connect MetaMask Wallet",
      no_account: "Don't have an account?",
      has_account: "Already have an account?",
      register_link: "Register school account",
      forgot_password: "Forgot password?",
      institution_name: "Institution Name",
      institution_code: "Institution Code (uppercase, no accents)",
      admin_email: "Admin email (institution email)",
      admin_name: "Admin name",
      confirm_password: "Confirm password",
      password_hint: "Min 8 characters, uppercase, lowercase and number",
      password_confirm_placeholder: "Re-enter password",
      submit_register: "Submit registration",
      institution_code_hint: "Do not use personal email (gmail, yahoo...)",
      admin_email_placeholder: "admin@institution.edu.vn",
      hello: "Hello",
    },
  },
};

type TranslationRecord = Record<string, TranslationValue>;

export function t(locale: Locale, path: string): string {
  const keys = path.split(".");
  let current: TranslationValue | TranslationRecord = translations[locale];
  for (const key of keys) {
    if (typeof current === "object" && current !== null && !Array.isArray(current) && key in current) {
      current = (current as TranslationRecord)[key];
    } else {
      return path;
    }
  }
  if (typeof current === "string") return current;
  return path;
}

export function tArr(locale: Locale, path: string): TranslationValue[] {
  const keys = path.split(".");
  let current: TranslationValue | TranslationRecord = translations[locale];
  for (const key of keys) {
    if (typeof current === "object" && current !== null && !Array.isArray(current) && key in current) {
      current = (current as TranslationRecord)[key];
    } else {
      return [];
    }
  }
  if (Array.isArray(current)) return current;
  return [];
}

export const locales: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt" },
  { code: "en", label: "English", nativeLabel: "English" },
];
