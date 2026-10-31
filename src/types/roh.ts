/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RÖH — Robot Özel Harekât
 * Multi-Agent Command & Operations Center Types
 * Commander: Kamil Teacher
 * Chief Coordinator: Gemo
 */

export type AgentCode = 
  | 'GEMO' 
  | 'DEDEKTIF' 
  | 'ANALIST' 
  | 'MUHENDIS' 
  | 'KREATIF' 
  | 'YAZAR' 
  | 'TURK' 
  | 'MUFETTIS';

export type AgentStatus = 'IDLE' | 'WORKING' | 'INSPECTING' | 'WAITING' | 'ERROR';

export interface AgentProfile {
  code: AgentCode;
  name: string;
  role: string;
  callsign: string;
  rank: string;
  specialization: string;
  description: string;
  systemInstruction: string;
  tools: string[];
  status: AgentStatus;
  currentTaskId?: string;
  color: string;
  accentBg: string;
  borderAccent: string;
}

export type OperationStatus =
  | 'DRAFT'                    // Taslak
  | 'AWAITING_APPROVAL'       // Kamil Teacher Onayı Bekleniyor
  | 'PLANNED'                 // Onaylandı, Planlandı
  | 'RUNNING'                 // İcrada (Uzmanlar Çalışıyor)
  | 'INSPECTING'              // Müfettiş Bağımsız Denetiminde
  | 'COMPLETED'               // Kanıta Dayalı Tamamlandı
  | 'PAUSED'                  // Komutan Tarafından Durduruldu
  | 'FAILED'                  // Başarısız / Hata
  | 'CANCELLED';              // Komutan Tarafından İptal Edildi

export type TaskStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
  retrievedAt: string;
  verified: boolean;
}

export interface OperationTask {
  id: string;
  title: string;
  description: string;
  assignedAgent: AgentCode;
  dependencies: string[]; // Task IDs that must finish first
  status: TaskStatus;
  requiresGrounding?: boolean;
  requiredApproval?: boolean;
  inputData?: string;
  outputResult?: string;
  groundingSources?: GroundingSource[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export type MessageType =
  | 'PLAN_PROPOSAL'
  | 'TASK_ASSIGNMENT'
  | 'DATA_SHARE'
  | 'QUERY'
  | 'RESPONSE'
  | 'INSPECTION_REQUEST'
  | 'INSPECTION_RESULT'
  | 'STATUS_UPDATE'
  | 'COMMANDER_ORDER';

export interface InterAgentMessage {
  id: string;
  operationId: string;
  timestamp: string;
  fromAgent: AgentCode | 'KOMUTAN_KAMIL_TEACHER';
  toAgent: AgentCode | 'KOMUTAN_KAMIL_TEACHER' | 'ALL';
  type: MessageType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface InspectorAudit {
  inspectedAt: string;
  inspectorAgent: 'MUFETTIS';
  score: number; // 0 - 100
  verdict: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED';
  verdictTr: 'ONAYLANDI' | 'REVİZYON GEREKLİ' | 'REDDEDİLDİ';
  summary: string;
  criteriaScores: {
    factualGrounding: number;      // Gerçek kaynak ve kanıt doğruluğu
    directiveFulfillment: number;  // Komutan Kamil Teacher'ın talimatına uygunluk
    hallucinationCheck: number;    // Uydurma/varsayımsal bilgi içermeme
    technicalQuality: number;      // Teknik ve yapısal doğruluk
    actionability: number;         // Uygulanabilirlik ve netlik
  };
  strengths: string[];
  concernsOrFlaws: string[];
  recommendations: string[];
}

export interface FinalMissionReport {
  generatedAt: string;
  coordinator: 'GEMO';
  title: string;
  executiveSummary: string;
  deliverablesByAgent: {
    agentCode: AgentCode;
    agentName: string;
    taskTitle: string;
    summary: string;
    content: string;
    groundingSourcesCount: number;
  }[];
  groundingSources: GroundingSource[];
  inspectorVerdict: {
    verdict: string;
    score: number;
    summary: string;
  };
  conclusion: string;
  nextStepsForCommander: string[];
}

export interface Operation {
  id: string;
  codeName: string;
  createdAt: string;
  updatedAt: string;
  commander: 'Kamil Teacher';
  coordinator: 'Gemo';
  objective: string;
  constraints?: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: OperationStatus;
  commanderApproved: boolean;
  commanderApprovedAt?: string;
  tasks: OperationTask[];
  messages: InterAgentMessage[];
  groundingSources: GroundingSource[];
  inspectorAudit?: InspectorAudit;
  finalReport?: FinalMissionReport;
  error?: string;
}

export interface SystemHealth {
  status: 'ONLINE' | 'DEGRADED';
  commander: 'Kamil Teacher';
  coordinator: 'Gemo';
  systemTime: string;
  activeAgentsCount: number;
  totalAgentsCount: number;
  geminiApiKeyConfigured: boolean;
  searchGroundingEnabled: boolean;
  model: string;
}
