export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
export type EvidenceType = 'IMAGE' | 'CHAT' | 'TEXT';
export type AnalysisStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Case {
  id: string;
  case_id: string;
  title: string;
  description: string;
  investigator_id?: string | null;
  status: CaseStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  evidence_id: string;
  case_id: string;
  type: EvidenceType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  source: string;
  uploaded_at: string;
  analysis_status: AnalysisStatus;
  metadata?: Record<string, any>;
}

export interface ExtractedEntities {
  people?: string[];
  usernames?: string[];
  phone_numbers?: string[];
  emails?: string[];
  urls?: string[];
  ip_addresses?: string[];
  locations?: string[];
  organizations?: string[];
  dates?: string[];
  visible_text?: string[];
  documents?: string[];
  objects?: string[];
}

export interface SuspiciousIndicator {
  type: string;
  value: string;
  context: string;
  risk_factor?: string;
}

export interface Finding {
  id: string;
  finding_id: string;
  case_id: string;
  evidence_id?: string | null;
  finding_type: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  entities: ExtractedEntities;
  indicators: SuspiciousIndicator[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AIAnalysisResult {
  summary: string;
  finding_type: string;
  title: string;
  description: string;
  suggested_severity: SeverityLevel;
  confidence: number;
  reasoning: string;
  entities: ExtractedEntities;
  indicators: SuspiciousIndicator[];
  raw_provider?: string;
}
