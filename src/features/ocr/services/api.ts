import type { DiplomaExtractionResponse, OcrResponse, SupportedLanguages } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

export const ocrApi = {
  getSupportedLanguages: () =>
    request<SupportedLanguages>('/ocr/supported-languages'),

  extractText: (file: File, language = 'eng') => {
    const formData = new FormData();
    formData.append('file', file);
    return request<OcrResponse>(`/ocr/extract-text?language=${language}`, {
      method: 'POST',
      body: formData,
    });
  },

  extractDiploma: (file: File, language = 'vie') => {
    const formData = new FormData();
    formData.append('file', file);
    return request<DiplomaExtractionResponse>(`/ocr/extract-diploma?language=${language}`, {
      method: 'POST',
      body: formData,
    });
  },
};
