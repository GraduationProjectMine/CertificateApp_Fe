import type { DiplomaExtractionResponse, OcrResponse, SupportedLanguages } from '../types';

import { request } from "@/lib/api";

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
