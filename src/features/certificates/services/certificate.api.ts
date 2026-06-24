const API_BASE = "/api";

export async function fetchCertificates() {
  const res = await fetch(`${API_BASE}/certificates`);
  return res.json();
}

export async function fetchCertificate(id: string) {
  const res = await fetch(`${API_BASE}/certificates/${id}`);
  return res.json();
}

export async function createCertificate(data: any) {
  const res = await fetch(`${API_BASE}/certificates/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
