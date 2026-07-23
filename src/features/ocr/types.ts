export interface OcrResponse {
  extractedText: string;
  accuracy: number;
  language: string;
}

export interface DiplomaData {
  document_title?: string;
  full_name?: string;
  dob?: string;
  place_of_birth?: string;
  gender?: string;
  ethnicity?: string;
  school_name?: string;
  exam_cohort?: string;
  exam_board?: string;
  issue_location?: string;
  issue_date?: string;
  serial_number?: string;
  registry_number?: string;
}

export interface DiplomaExtractionResponse {
  data: DiplomaData;
  accuracy: number;
  rawText: string;
  validationErrors?: Record<string, string>;
  ipfs_cid?: string;
  ipfs_url?: string;
  sha3_hash?: string;
}

export interface SupportedLanguages {
  [key: string]: string;
}
