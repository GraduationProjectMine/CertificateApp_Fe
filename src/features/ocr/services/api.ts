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

  extractDiplomasBatch: (files: File[], language = 'vie') => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return request<{
      total: number;
      results: Array<{
        rowNumber: number;
        fileName: string;
        data: Record<string, string>;
        accuracy: number;
        validationErrors?: Record<string, string>;
        ipfs_cid?: string;
        ipfs_url?: string;
        error?: string;
      }>;
    }>(`/ocr/extract-diplomas-batch?language=${language}`, {
      method: 'POST',
      body: formData,
    });
  },
};
