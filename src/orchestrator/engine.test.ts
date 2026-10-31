/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unit tests for RÖH Pure Orchestration Logic
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getReadyTasks,
  validateOperationStart,
  areAllTasksCompleted,
  buildInterAgentMessage,
  processInspectorAudit,
  compileMarkdownReport,
} from './engine.ts';
import { Operation, OperationTask } from '../types/roh.ts';

test('DAG resolution: getReadyTasks identifies tasks whose dependencies are met', () => {
  const tasks: OperationTask[] = [
    {
      id: 'task-1',
      title: 'İstihbarat ve Web Araştırması',
      description: 'Web araştırması yap',
      assignedAgent: 'DEDEKTIF',
      dependencies: [],
      status: 'COMPLETED',
    },
    {
      id: 'task-2',
      title: 'Strateji ve Veri Karşılaştırması',
      description: 'Verileri incele',
      assignedAgent: 'ANALIST',
      dependencies: ['task-1'],
      status: 'PENDING',
    },
    {
      id: 'task-3',
      title: 'Rapor Yazımı',
      description: 'Sonuçları yaz',
      assignedAgent: 'YAZAR',
      dependencies: ['task-2'],
      status: 'PENDING',
    },
    {
      id: 'task-4',
      title: 'Arayüz İncelemesi',
      description: 'Bağımsız UI kontrolü',
      assignedAgent: 'KREATIF',
      dependencies: [],
      status: 'PENDING',
    },
  ];

  const ready = getReadyTasks(tasks);
  // task-2 (dep task-1 completed) and task-4 (no deps) should be ready
  // task-3 should NOT be ready because task-2 is still PENDING
  assert.equal(ready.length, 2);
  const readyIds = ready.map(t => t.id);
  assert.ok(readyIds.includes('task-2'));
  assert.ok(readyIds.includes('task-4'));
  assert.ok(!readyIds.includes('task-3'));
});

test('Commander Approval Gate: validateOperationStart blocks unapproved operations', () => {
  const unapprovedOp: Operation = {
    id: 'op-001',
    codeName: 'OP-PARS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    commander: 'Kamil Teacher',
    coordinator: 'Gemo',
    objective: 'Test görevi',
    priority: 'HIGH',
    status: 'AWAITING_APPROVAL',
    commanderApproved: false,
    tasks: [
      {
        id: 't-1',
        title: 'Görev 1',
        description: 'Detay',
        assignedAgent: 'DEDEKTIF',
        dependencies: [],
        status: 'PENDING',
      },
    ],
    messages: [],
    groundingSources: [],
  };

  const checkUnapproved = validateOperationStart(unapprovedOp);
  assert.equal(checkUnapproved.allowed, false);
  assert.match(checkUnapproved.reason!, /Kamil Teacher/);

  // When Commander approves
  const approvedOp: Operation = {
    ...unapprovedOp,
    commanderApproved: true,
    status: 'PLANNED',
  };
  const checkApproved = validateOperationStart(approvedOp);
  assert.equal(checkApproved.allowed, true);
});

test('Task completion status check: areAllTasksCompleted', () => {
  const incompleteTasks: OperationTask[] = [
    { id: '1', title: 'T1', description: '', assignedAgent: 'DEDEKTIF', dependencies: [], status: 'COMPLETED' },
    { id: '2', title: 'T2', description: '', assignedAgent: 'ANALIST', dependencies: [], status: 'IN_PROGRESS' },
  ];
  assert.equal(areAllTasksCompleted(incompleteTasks), false);

  const completedTasks: OperationTask[] = [
    { id: '1', title: 'T1', description: '', assignedAgent: 'DEDEKTIF', dependencies: [], status: 'COMPLETED' },
    { id: '2', title: 'T2', description: '', assignedAgent: 'ANALIST', dependencies: [], status: 'SKIPPED' },
  ];
  assert.equal(areAllTasksCompleted(completedTasks), true);
});

test('Message routing: buildInterAgentMessage creates valid timestamped message', () => {
  const msg = buildInterAgentMessage({
    operationId: 'op-101',
    fromAgent: 'GEMO',
    toAgent: 'DEDEKTIF',
    type: 'TASK_ASSIGNMENT',
    title: 'Görev Emri: Web Araştırması',
    content: 'Hedef şirket verilerini araştır.',
  });

  assert.ok(msg.id.startsWith('msg-'));
  assert.equal(msg.operationId, 'op-101');
  assert.equal(msg.fromAgent, 'GEMO');
  assert.equal(msg.toAgent, 'DEDEKTIF');
  assert.equal(msg.type, 'TASK_ASSIGNMENT');
  assert.equal(msg.title, 'Görev Emri: Web Araştırması');
  assert.ok(typeof msg.timestamp === 'string');
});

test('Müfettiş Independent Audit: computes weighted score and sets proper verdict', () => {
  const highQualityInput = {
    scores: {
      factualGrounding: 90,
      directiveFulfillment: 95,
      hallucinationCheck: 95,
      technicalQuality: 85,
      actionability: 90,
    },
    summary: 'Tüm bulgular doğrulanmış kaynaklara dayanıyor ve komutan emrine uygun.',
    strengths: ['Gerçek web grounding referansları eksiksiz', 'Çelişkili bilgiler açıkça belirtilmiş'],
    concernsOrFlaws: [],
    recommendations: ['Rapor Komutana sunulabilir'],
  };

  const audit = processInspectorAudit(highQualityInput);
  assert.equal(audit.inspectorAgent, 'MUFETTIS');
  assert.ok(audit.score >= 80);
  assert.equal(audit.verdict, 'APPROVED');
  assert.equal(audit.verdictTr, 'ONAYLANDI');

  const flawedInput = {
    scores: {
      factualGrounding: 40, // Critical failure
      directiveFulfillment: 80,
      hallucinationCheck: 45,
      technicalQuality: 70,
      actionability: 60,
    },
    summary: 'Kaynak gösterilmemiş iddialar tespit edildi.',
    strengths: [],
    concernsOrFlaws: ['Doğrulanmamış kaynaklar mevcut'],
    recommendations: ['Yeniden araştırma yapılmalı'],
  };

  const failedAudit = processInspectorAudit(flawedInput);
  assert.equal(failedAudit.verdict, 'REJECTED');
  assert.equal(failedAudit.verdictTr, 'REDDEDİLDİ');
});

test('Markdown report compilation includes Commander, Coordinator, and sections', () => {
  const op: Operation = {
    id: 'op-test',
    codeName: 'OP-KARTAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    commander: 'Kamil Teacher',
    coordinator: 'Gemo',
    objective: 'Almanca A1 gramer eğitim rehberi hazırla',
    priority: 'HIGH',
    status: 'COMPLETED',
    commanderApproved: true,
    tasks: [
      {
        id: 't-1',
        title: 'A1 Almanca Müfredatı Hazırlama',
        description: 'Müfredat çıkar',
        assignedAgent: 'TURK',
        dependencies: [],
        status: 'COMPLETED',
        outputResult: 'Artikel kullanımı ve temel fiil çekimleri modülü tamamlandı.',
      },
    ],
    messages: [],
    groundingSources: [
      {
        title: 'Goethe Institut A1 Exam Guide',
        url: 'https://www.goethe.de/a1',
        retrievedAt: new Date().toISOString(),
        verified: true,
      },
    ],
    inspectorAudit: {
      inspectedAt: new Date().toISOString(),
      inspectorAgent: 'MUFETTIS',
      score: 94,
      verdict: 'APPROVED',
      verdictTr: 'ONAYLANDI',
      summary: 'Eğitim materyali kusursuz ve A1 seviyesine tam uygun.',
      criteriaScores: {
        factualGrounding: 95,
        directiveFulfillment: 98,
        hallucinationCheck: 95,
        technicalQuality: 92,
        actionability: 90,
      },
      strengths: ['Örnek cümleler çok açık'],
      concernsOrFlaws: [],
      recommendations: [],
    },
  };

  const md = compileMarkdownReport(op);
  assert.match(md, /RÖH — ROBOT ÖZEL HAREKÂT/);
  assert.match(md, /Kamil Teacher/);
  assert.match(md, /Gemo/);
  assert.match(md, /OP-KARTAL/);
  assert.match(md, /Goethe Institut A1 Exam Guide/);
  assert.match(md, /94 \/ 100/);
});
