/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RÖH — Robot Özel Harekât Full-Stack Express Server
 * Mounted with Vite dev middleware
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { isApiKeyConfigured, MODEL_NAME } from './server/gemini.ts';
import { AGENTS_LIST } from './src/orchestrator/agents.ts';
import {
  getAllOperations,
  getOperationById,
  deleteOperation,
  clearAllOperations,
} from './server/store.ts';
import {
  planOperation,
  approveOperation,
  pauseOperation,
  cancelOperation,
  executeNextStep,
  runAllRemainingSteps,
  retryOperation,
} from './server/orchestrator-service.ts';
import { compileMarkdownReport } from './src/orchestrator/engine.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// --- API ROUTES ---

// Health & System Status
app.get('/api/health', (req: Request, res: Response) => {
  const allOps = getAllOperations();
  const activeOps = allOps.filter(o => o.status === 'RUNNING' || o.status === 'INSPECTING').length;

  res.json({
    status: 'ONLINE',
    commander: 'Kamil Teacher',
    coordinator: 'Gemo',
    systemTime: new Date().toISOString(),
    geminiApiKeyConfigured: isApiKeyConfigured,
    searchGroundingEnabled: true,
    model: MODEL_NAME,
    totalAgents: AGENTS_LIST.length,
    activeOperationsCount: activeOps,
    totalOperationsCount: allOps.length,
  });
});

// Agents Registry
app.get('/api/agents', (req: Request, res: Response) => {
  res.json(AGENTS_LIST);
});

// Operations list
app.get('/api/operations', (req: Request, res: Response) => {
  const operations = getAllOperations();
  res.json(operations);
});

// Single operation details
app.get('/api/operations/:id', (req: Request, res: Response) => {
  const op = getOperationById(req.params.id);
  if (!op) {
    res.status(404).json({ error: 'Operasyon bulunamadı.' });
    return;
  }
  res.json(op);
});

// Plan a new operation (Directive submitted to Gemo -> Gemo creates plan -> Awaiting Approval)
app.post('/api/operations/plan', async (req: Request, res: Response) => {
  try {
    const { objective, constraints, priority } = req.body;
    if (!objective || typeof objective !== 'string' || objective.trim().length === 0) {
      res.status(400).json({ error: 'Operasyon hedefi zorunludur.' });
      return;
    }

    const newOp = await planOperation({
      objective: objective.trim(),
      constraints: constraints?.trim(),
      priority: priority || 'HIGH',
    });

    res.status(201).json(newOp);
  } catch (err: any) {
    console.error('Plan operation error:', err);
    res.status(500).json({ error: err.message || 'Operasyon planlanırken hata oluştu.' });
  }
});

// Commander Kamil Teacher explicitly approves the plan
app.post('/api/operations/:id/approve', (req: Request, res: Response) => {
  try {
    const { commanderConfirmed } = req.body;
    if (commanderConfirmed !== true) {
      res.status(403).json({
        error: 'YETKİ İHLALİ: Operasyon ancak Komutan Kamil Teacher tarafından açıkça onaylanabilir.',
      });
      return;
    }

    const updated = approveOperation(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commander pauses the operation
app.post('/api/operations/:id/pause', (req: Request, res: Response) => {
  try {
    const updated = pauseOperation(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commander cancels the operation
app.post('/api/operations/:id/cancel', (req: Request, res: Response) => {
  try {
    const updated = cancelOperation(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Step: Execute next task in DAG or trigger inspection/report
app.post('/api/operations/:id/step', async (req: Request, res: Response) => {
  try {
    const updated = await executeNextStep(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run all remaining tasks in the operation automatically
app.post('/api/operations/:id/run-all', async (req: Request, res: Response) => {
  try {
    const updated = await runAllRemainingSteps(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Retry failed operation tasks
app.post('/api/operations/:id/retry', (req: Request, res: Response) => {
  try {
    const updated = retryOperation(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an operation (Requires explicit confirmation)
app.delete('/api/operations/:id', (req: Request, res: Response) => {
  const { commanderConfirmed } = req.body;
  if (!commanderConfirmed) {
    res.status(403).json({
      error: 'GÜVENLİK KURALI: Bir operasyon kaydını silmek için Komutan Kamil Teacher onayı şarttır.',
    });
    return;
  }

  const success = deleteOperation(req.params.id);
  if (success) {
    res.json({ message: 'Operasyon kaydı kalıcı olarak silindi.' });
  } else {
    res.status(404).json({ error: 'Operasyon bulunamadı.' });
  }
});

// Clear all operations
app.post('/api/operations/clear-all', (req: Request, res: Response) => {
  const { commanderConfirmed } = req.body;
  if (!commanderConfirmed) {
    res.status(403).json({
      error: 'GÜVENLİK KURALI: Tüm operasyon kayıtlarını temizlemek için Komutan Kamil Teacher onayı şarttır.',
    });
    return;
  }

  clearAllOperations();
  res.json({ message: 'Tüm operasyon kayıtları sıfırlandı.' });
});

// Export operation report
app.get('/api/operations/:id/export/:format', (req: Request, res: Response) => {
  const op = getOperationById(req.params.id);
  if (!op) {
    res.status(404).json({ error: 'Operasyon bulunamadı.' });
    return;
  }

  const format = req.params.format;
  if (format === 'markdown' || format === 'md') {
    const md = compileMarkdownReport(op);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${op.codeName}-RAPOR.md"`);
    res.send(md);
  } else if (format === 'json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${op.codeName}.json"`);
    res.json(op);
  } else {
    res.status(400).json({ error: 'Desteklenmeyen format. (md veya json kullanın)' });
  }
});

// Vite middleware or Static build serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RÖH OPERASYON MERKEZİ] Server çalışıyor: http://0.0.0.0:${PORT}`);
    console.log(`[KOMUTAN] Kamil Teacher | [BAŞ KOORDİNATÖR] Gemo`);
    console.log(`[GEMINI API] ${isApiKeyConfigured ? 'AKTİF (' + MODEL_NAME + ')' : 'ANAHTAR BEKLENİYOR / YEDEK MOD'}`);
  });
}

startServer();
