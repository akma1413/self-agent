export type IsoDateString = string;

export type JsonObject = Record<string, unknown>;

export interface Agenda {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  created_at?: IsoDateString;
  updated_at?: IsoDateString;
}

export interface ActionPayload {
  command?: string;
  install_command?: string;
  post_steps?: string[];
  post_install?: string[];
  rollback?: string;
  rollback_command?: string;
  docs_url?: string;
  documentation_url?: string;
  estimated_time?: string;
  difficulty?: string;
  steps?: string[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  action_type: string;
  priority: string;
  status: string;
  created_at: IsoDateString;
  report_id?: string | null;
  payload?: ActionPayload | null;
}

export interface PrincipleEvidence extends JsonObject {
  text?: string;
}

export interface Principle {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  category: string;
  confidence: number;
  evidence?: PrincipleEvidence[];
  created_at: IsoDateString;
}

export interface ReportAnalysisBenefit {
  impact?: string;
  description?: string;
}

export interface ReportAnalysisDifference {
  what_changes?: string;
  breaking_changes?: string[];
  compatible?: string[];
}

export interface ReportAnalysisMigrationGuide {
  estimated_time?: string;
  difficulty?: string;
  steps?: string[];
  rollback?: string;
}

export interface ReportAnalysisUsageGuide {
  getting_started?: string;
  key_features?: string[];
  tips?: string[];
}

export interface ReportAnalysisDecisionFactors {
  adopt_if?: string[];
  skip_if?: string[];
}

export interface ReportAnalysis {
  verdict?: string;
  confidence?: number;
  difference_from_current?: ReportAnalysisDifference;
  benefits?: ReportAnalysisBenefit[];
  migration_guide?: ReportAnalysisMigrationGuide;
  usage_guide?: ReportAnalysisUsageGuide;
  decision_factors?: ReportAnalysisDecisionFactors;
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  report_type: string;
  status: string;
  created_at: IsoDateString;
  updated_at: IsoDateString;
  agenda_id?: string | null;
  analysis?: ReportAnalysis | null;
}

export type ProcessResult = JsonObject;
export type WeeklySummary = JsonObject;
export type PipelineRunResult = JsonObject;
