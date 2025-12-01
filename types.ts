
export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'processing' | 'ready' | 'error';
  summary?: string;
  content?: string; // Base64 content for preview
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  DOCUMENT_DETAIL = 'DOCUMENT_DETAIL',
  WORKFLOWS = 'WORKFLOWS',
  SETTINGS = 'SETTINGS'
}

export interface GeminiResponse {
  text: string;
}

// Workflow Types
export type TriggerType = 'ON_UPLOAD' | 'ON_SCHEDULE' | 'MANUAL';
export type ActionType = 'GEMINI_SUMMARY' | 'GEMINI_EXTRACT' | 'PDF_MERGE' | 'PDF_SPLIT' | 'PDF_WATERMARK' | 'CONVERT_TEXT';

export interface WorkflowStep {
  id: string;
  type: ActionType;
  name: string;
  config?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: TriggerType;
  steps: WorkflowStep[];
  lastRun?: Date;
  runCount: number;
}

// Workflow History Types
export type RunStatus = 'SUCCESS' | 'ERROR' | 'RUNNING';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  date: Date;
  status: RunStatus;
  duration: string;
  details: string; // e.g. "Processed 'Contract.pdf', generated summary"
  triggeredBy: string; // e.g. "System", "Manual", "User1"
}
