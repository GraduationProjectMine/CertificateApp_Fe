export function formatDate(date: string | Date, format: "short" | "long" | "full" = "short"): string {
  const d = new Date(date);
  switch (format) {
    case "short": return d.toLocaleDateString("vi-VN");
    case "long": return d.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
    case "full": return d.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
}
