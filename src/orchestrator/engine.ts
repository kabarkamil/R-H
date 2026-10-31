/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RÖH — Pure Orchestration & Verification Engine
 * Logic decoupled for fast unit testing and reliability
 */

import {
  Operation,
  OperationTask,
  TaskStatus,
  InterAgentMessage,
  MessageType,
  AgentCode,
  InspectorAudit,
  FinalMissionReport,
  GroundingSource
} from '../types/roh.ts';

/**
 * Returns tasks that are ready for execution (all dependencies completed, status pending or ready).
 */
export function getReadyTasks(tasks: OperationTask[]): OperationTask[] {
  const completedTaskIds = new Set(
    tasks.filter(t => t.status === 'COMPLETED').map(t => t.id)
  );

  return tasks.filter(task => {
    if (task.status !== 'PENDING' && task.status !== 'READY') {
      return false;
    }
    // Check if every dependency is in completedTaskIds
    const allDepsCompleted = task.dependencies.every(depId => completedTaskIds.has(depId));
    return allDepsCompleted;
  });
}

/**
 * Enforces Commander Kamil Teacher's absolute approval gate.
 */
export function validateOperationStart(operation: Operation): { allowed: boolean; reason?: string } {
  if (!operation.commanderApproved) {
    return {
      allowed: false,
      reason: "HİYERARŞİ İHLALİ: Komutan Kamil Teacher'ın açık onayı olmadan hiçbir operasyon başlatılamaz.",
    };
  }

  if (operation.status === 'CANCELLED') {
    return {
      allowed: false,
      reason: "İptal edilmiş operasyon başlatılamaz. Yeni operasyon taslağı oluşturulmalıdır.",
    };
  }

  if (!operation.tasks || operation.tasks.length === 0) {
    return {
      allowed: false,
      reason: "Operasyona atanmış geçerli bir görev planı bulunmuyor.",
    };
  }

  return { allowed: true };
}

/**
 * Checks if all non-skipped tasks in an operation are completed.
 */
export function areAllTasksCompleted(tasks: OperationTask[]): boolean {
  if (!tasks || tasks.length === 0) return false;
  return tasks.every(t => t.status === 'COMPLETED' || t.status === 'SKIPPED');
}

/**
 * Constructs a structured message for the inter-agent communication bus.
 */
export function buildInterAgentMessage(params: {
  operationId: string;
  fromAgent: AgentCode | 'KOMUTAN_KAMIL_TEACHER';
  toAgent: AgentCode | 'KOMUTAN_KAMIL_TEACHER' | 'ALL';
  type: MessageType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}): InterAgentMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    operationId: params.operationId,
    timestamp: new Date().toISOString(),
    fromAgent: params.fromAgent,
    toAgent: params.toAgent,
    type: params.type,
    title: params.title,
    content: params.content,
    metadata: params.metadata,
  };
}

/**
 * Validates and calculates final Inspector (Müfettiş) audit decision.
 */
export function processInspectorAudit(auditInput: {
  scores: {
    factualGrounding: number;
    directiveFulfillment: number;
    hallucinationCheck: number;
    technicalQuality: number;
    actionability: number;
  };
  summary: string;
  strengths: string[];
  concernsOrFlaws: string[];
  recommendations: string[];
}): InspectorAudit {
  const c = auditInput.scores;
  // Weighted average: Factual grounding (25%), Directive (25%), Hallucination (25%), Tech (15%), Actionability (10%)
  const compositeScore = Math.round(
    c.factualGrounding * 0.25 +
    c.directiveFulfillment * 0.25 +
    c.hallucinationCheck * 0.25 +
    c.technicalQuality * 0.15 +
    c.actionability * 0.10
  );

  let verdict: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED';
  let verdictTr: 'ONAYLANDI' | 'REVİZYON GEREKLİ' | 'REDDEDİLDİ';

  // Strict audit rules:
  // Any critical failure (< 60 in grounding or directive) or composite < 75 rejects/requires revision
  if (c.factualGrounding < 50 || c.hallucinationCheck < 50 || c.directiveFulfillment < 50) {
    verdict = 'REJECTED';
    verdictTr = 'REDDEDİLDİ';
  } else if (compositeScore >= 80 && c.factualGrounding >= 70 && c.directiveFulfillment >= 70) {
    verdict = 'APPROVED';
    verdictTr = 'ONAYLANDI';
  } else {
    verdict = 'REVISION_REQUIRED';
    verdictTr = 'REVİZYON GEREKLİ';
  }

  return {
    inspectedAt: new Date().toISOString(),
    inspectorAgent: 'MUFETTIS',
    score: compositeScore,
    verdict,
    verdictTr,
    summary: auditInput.summary,
    criteriaScores: c,
    strengths: auditInput.strengths || [],
    concernsOrFlaws: auditInput.concernsOrFlaws || [],
    recommendations: auditInput.recommendations || [],
  };
}

/**
 * Compiles a comprehensive mission report in Markdown format.
 */
export function compileMarkdownReport(operation: Operation): string {
  const parts: string[] = [];

  parts.push(`# RÖH — ROBOT ÖZEL HAREKÂT`);
  parts.push(`## RESMİ OPERASYON RAPORU`);
  parts.push(``);
  parts.push(`**Operasyon Kodu:** ${operation.codeName} (ID: \`${operation.id}\`)`);
  parts.push(`**Sistem Sahibi ve Tek Komutan:** Kamil Teacher`);
  parts.push(`**Baş Koordinatör:** Gemo`);
  parts.push(`**Tarih:** ${new Date(operation.updatedAt).toLocaleString('tr-TR')}`);
  parts.push(`**Operasyon Durumu:** ${operation.status}`);
  parts.push(`**Komutan Onayı:** ${operation.commanderApproved ? 'ONAYLANDI' : 'ONAYLANMADI'}`);
  parts.push(``);
  parts.push(`---`);
  parts.push(``);
  parts.push(`### 1. OPERASYON HEDEFİ VE SINIRLARI`);
  parts.push(`> **Hedef:** ${operation.objective}`);
  if (operation.constraints) {
    parts.push(`> **Kısıtlamalar:** ${operation.constraints}`);
  }
  parts.push(``);

  parts.push(`### 2. MÜFETTİŞ BAĞIMSIZ KALİTE DENETİMİ`);
  if (operation.inspectorAudit) {
    const audit = operation.inspectorAudit;
    parts.push(`- **Karar:** ${audit.verdictTr} (${audit.verdict})`);
    parts.push(`- **Kalite Puanı:** ${audit.score} / 100`);
    parts.push(`- **Denetim Özeti:** ${audit.summary}`);
    parts.push(``);
    parts.push(`#### Kriter Puanları:`);
    parts.push(`- Kanıt ve Kaynak Güvenilirliği: ${audit.criteriaScores.factualGrounding}/100`);
    parts.push(`- Komutan Kamil Teacher Talimatına Uyum: ${audit.criteriaScores.directiveFulfillment}/100`);
    parts.push(`- Uydurma / Halüsinasyon Yokluğu: ${audit.criteriaScores.hallucinationCheck}/100`);
    parts.push(`- Teknik ve Yapısal Doğruluk: ${audit.criteriaScores.technicalQuality}/100`);
    parts.push(`- Uygulanabilirlik ve Netlik: ${audit.criteriaScores.actionability}/100`);
    parts.push(``);

    if (audit.strengths.length > 0) {
      parts.push(`**Güçlü Yönler:**`);
      audit.strengths.forEach(s => parts.push(`- ${s}`));
      parts.push(``);
    }
    if (audit.concernsOrFlaws.length > 0) {
      parts.push(`**Tespit Edilen Kusurlar / İkazlar:**`);
      audit.concernsOrFlaws.forEach(c => parts.push(`- ${c}`));
      parts.push(``);
    }
  } else {
    parts.push(`*Bu operasyon için henüz Müfettiş denetimi tamamlanmadı.*`);
    parts.push(``);
  }

  parts.push(`### 3. UZMAN AJAN ÇIKTILARI VE İCRA DETAYLARI`);
  operation.tasks.forEach((task, idx) => {
    parts.push(`#### Görev #${idx + 1}: ${task.title}`);
    parts.push(`- **Atanan Ajan:** ${task.assignedAgent}`);
    parts.push(`- **Durum:** ${task.status}`);
    parts.push(`- **Görev Tanımı:** ${task.description}`);
    if (task.outputResult) {
      parts.push(``);
      parts.push(`##### Çıktı:`);
      parts.push(task.outputResult);
      parts.push(``);
    }
    if (task.groundingSources && task.groundingSources.length > 0) {
      parts.push(`##### Doğrulanmış Kaynaklar (${task.groundingSources.length}):`);
      task.groundingSources.forEach(src => {
        parts.push(`- [${src.title}](${src.url}) (Doğrulandı: ${src.verified ? 'Evet' : 'İnceleniyor'})`);
      });
      parts.push(``);
    }
    parts.push(`---`);
  });

  parts.push(`### 4. DOĞRULANMIŞ GERÇEK KAYNAKLAR (GROUNDING KAYITLARI)`);
  if (operation.groundingSources && operation.groundingSources.length > 0) {
    operation.groundingSources.forEach((src, idx) => {
      parts.push(`${idx + 1}. **${src.title}**`);
      parts.push(`   - URL: ${src.url}`);
      parts.push(`   - Alındığı Tarih: ${src.retrievedAt}`);
      if (src.snippet) {
        parts.push(`   - İntikal Eden Pasaj: "${src.snippet}"`);
      }
    });
  } else {
    parts.push(`*Bu operasyonda harici web araması yapılmamış veya kaynak referansı gerekmemiştir.*`);
  }
  parts.push(``);

  parts.push(`### 5. KOMUTANA ARZ VE SONUÇ`);
  if (operation.finalReport) {
    parts.push(operation.finalReport.conclusion);
    parts.push(``);
    if (operation.finalReport.nextStepsForCommander.length > 0) {
      parts.push(`**Komutan Kamil Teacher İçin Sonraki Eylem Önerileri:**`);
      operation.finalReport.nextStepsForCommander.forEach(step => parts.push(`- [ ] ${step}`));
    }
  } else {
    parts.push(`Operasyon icrası tamamlanmış olup Baş Koordinatör Gemo tarafından Komutan Kamil Teacher'ın incelemesine ve nihai takdirine sunulmuştur.`);
  }

  return parts.join('\n');
}
