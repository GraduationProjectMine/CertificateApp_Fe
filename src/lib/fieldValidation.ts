export type ValidationRule = {
  type: "number" | "text" | "alphanumeric" | "date" | "email" | "custom";
  pattern?: RegExp;
  message?: string;
  allowSpaces?: boolean;
  minLength?: number;
  maxLength?: number;
};

export const fieldValidations: Record<string, ValidationRule> = {
  student_id: {
    type: "alphanumeric",
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: "Chỉ được nhập chữ, số, dấu gạch ngang hoặc gạch dưới",
    maxLength: 50,
  },
  student_fullName: {
    type: "text",
    pattern: /^[\p{L}\s.'-]+$/u,
    message: "Chỉ được nhập chữ, khoảng trắng, dấu chấm, nháy đơn hoặc gạch ngang",
    allowSpaces: true,
    maxLength: 100,
  },
  certificate_title: {
    type: "text",
    pattern: /^[\p{L}\s\d.,()\-–—:/]+$/u,
    message: "Chỉ được nhập chữ, số, khoảng trắng và các dấu câu cơ bản",
    allowSpaces: true,
    maxLength: 200,
  },
  dob: {
    type: "date",
    message: "Ngày sinh không hợp lệ (dd/mm/yyyy)",
  },
  placeOfBirth: {
    type: "text",
    pattern: /^[\p{L}\s\d.,()-]+$/u,
    message: "Chỉ được nhập chữ, số, khoảng trắng và các dấu câu cơ bản",
    allowSpaces: true,
    maxLength: 100,
  },
  gender: {
    type: "custom",
    pattern: /^(Nam|Nữ|Male|Female|Khác|Other)$/i,
    message: "Giới tính phải là: Nam, Nữ hoặc Khác",
  },
  ethnicity: {
    type: "text",
    pattern: /^[\p{L}\s]+$/u,
    message: "Chỉ được nhập chữ và khoảng trắng",
    allowSpaces: true,
    maxLength: 50,
  },
  schoolName: {
    type: "text",
    pattern: /^[\p{L}\s\d.,()-]+$/u,
    message: "Chỉ được nhập chữ, số, khoảng trắng và các dấu câu cơ bản",
    allowSpaces: true,
    maxLength: 150,
  },
  examCohort: {
    type: "alphanumeric",
    pattern: /^[\d\s/-]+$/,
    message: "Chỉ được nhập số, khoảng trắng, dấu gạch chéo hoặc gạch ngang",
    maxLength: 50,
  },
  examBoard: {
    type: "text",
    pattern: /^[\p{L}\s\d.,()-]+$/u,
    message: "Chỉ được nhập chữ, số, khoảng trắng và các dấu câu cơ bản",
    allowSpaces: true,
    maxLength: 100,
  },
  issueLocation: {
    type: "text",
    pattern: /^[\p{L}\s\d.,()-]+$/u,
    message: "Chỉ được nhập chữ, số, khoảng trắng và các dấu câu cơ bản",
    allowSpaces: true,
    maxLength: 100,
  },
  issueDate: {
    type: "date",
    message: "Ngày cấp không hợp lệ (dd/mm/yyyy)",
  },
  serialNumber: {
    type: "alphanumeric",
    pattern: /^[A-Z0-9\s-]+$/i,
    message: "Chỉ được nhập chữ in hoa, số và dấu gạch ngang (VD: B-0123456, B 589312)",
    allowSpaces: true,
    maxLength: 30,
  },
  registryNumber: {
    type: "alphanumeric",
    pattern: /^[\dA-Z/\s-]+$/i,
    message: "Chỉ được nhập số, chữ in hoa, dấu gạch chéo và gạch ngang (VD: 02047-0199, 1234/2024/THPT)",
    allowSpaces: true,
    maxLength: 40,
  },
};

export function validateField(fieldKey: string, value: string): { valid: boolean; message?: string } {
  const rule = fieldValidations[fieldKey];
  if (!rule) return { valid: true };

  const trimmed = value.trim();
  
  if (!trimmed) return { valid: true }; // Empty is handled by required validation

  switch (rule.type) {
    case "number":
      if (!/^\d+$/.test(trimmed)) {
        return { valid: false, message: rule.message || "Chỉ được nhập số" };
      }
      break;
      
    case "text":
      if (!rule.pattern!.test(trimmed)) {
        return { valid: false, message: rule.message || "Định dạng không hợp lệ" };
      }
      break;
      
    case "alphanumeric":
      if (!rule.pattern!.test(trimmed)) {
        return { valid: false, message: rule.message || "Chỉ được nhập chữ và số" };
      }
      break;
      
    case "date":
      if (!isValidDdMmYyyy(trimmed)) {
        return { valid: false, message: rule.message || "Ngày không hợp lệ (dd/mm/yyyy)" };
      }
      break;
      
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { valid: false, message: rule.message || "Email không hợp lệ" };
      }
      break;
      
    case "custom":
      if (rule.pattern && !rule.pattern.test(trimmed)) {
        return { valid: false, message: rule.message || "Giá trị không hợp lệ" };
      }
      break;
  }

  if (rule.minLength && trimmed.length < rule.minLength) {
    return { valid: false, message: `Tối thiểu ${rule.minLength} ký tự` };
  }
  if (rule.maxLength && trimmed.length > rule.maxLength) {
    return { valid: false, message: `Tối đa ${rule.maxLength} ký tự` };
  }

  return { valid: true };
}

export function sanitizeInput(fieldKey: string, value: string): string {
  const rule = fieldValidations[fieldKey];
  if (!rule) return value;

  let sanitized = value;

  switch (rule.type) {
    case "number":
      sanitized = value.replace(/\D/g, "");
      break;
      
    case "text":
      if (!rule.allowSpaces) {
        sanitized = value.replace(/\s/g, "");
      }
      // Remove invalid characters but keep valid ones
      if (rule.pattern) {
        // Keep only characters that match the pattern
        const allowedChars = rule.pattern.source
          .replace(/^[\^\$]/, "")
          .replace(/\]$/, "")
          .replace(/\\p\{L\}/g, "À-Ỹà-ỹ")
          .replace(/\\s/g, " ")
          .replace(/\\d/g, "0-9");
        // This is a simplified approach - just filter common invalid chars
        sanitized = value.replace(/[<>\"'&;|\\]/g, "");
      }
      break;
      
    case "alphanumeric":
      sanitized = rule.allowSpaces
        ? value.replace(/[^a-zA-Z0-9/\s-]/g, "").toUpperCase()
        : value.replace(/[^a-zA-Z0-9/-]/g, "").toUpperCase();
      break;
      
    case "date":
      // Handled by DateField component
      break;
      
    case "custom":
      if (rule.pattern) {
        // Just remove obviously invalid chars
        sanitized = value.replace(/[<>\"'&;|\\]/g, "");
      }
      break;
  }

  if (rule.maxLength && sanitized.length > rule.maxLength) {
    sanitized = sanitized.slice(0, rule.maxLength);
  }

  return sanitized;
}

function isValidDdMmYyyy(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return true;
}

export function formatDdMmYyyy(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 8) digits = digits.slice(0, 8);
  
  let formatted = "";
  if (digits.length >= 2) {
    formatted = digits.slice(0, 2);
    if (digits.length >= 4) {
      formatted += "/" + digits.slice(2, 4);
      if (digits.length > 4) {
        formatted += "/" + digits.slice(4, 8);
      }
    }
  } else {
    formatted = digits;
  }
  return formatted;
}