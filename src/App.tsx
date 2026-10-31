/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RÖH — ROBOT ÖZEL HAREKÂT
 * Çok Ajanlı Yapay Zekâ Komuta ve Operasyon Merkezi
 * Komutan: Kamil Teacher | Baş Koordinatör: Gemo
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Operation,
  AgentProfile,
  SystemHealth,
} from './types/roh.ts';
import { AGENTS_LIST } from './orchestrator/agents.ts';
import { Header } from './components/Header.tsx';
import { AgentStatusGrid } from './components/AgentStatusGrid.tsx';
import { ApprovalGateBanner } from './components/ApprovalGateBanner.tsx';
import { TaskDAGView } from './components/TaskDAGView.tsx';
import { InterAgentComms } from './components/InterAgentComms.tsx';
import { InspectorAuditCard } from './components/InspectorAuditCard.tsx';
import { GroundingSourcesView } from './components/GroundingSourcesView.tsx';
import { OperationReportView } from './components/OperationReportView.tsx';
import { OperationDirectiveModal } from './components/OperationDirectiveModal.tsx';
import { AgentDossierModal } from './components/AgentDossierModal.tsx';
import { SecurityPanelModal } from './components/SecurityPanelModal.tsx';
import {
  Shield,
  Play,
  FastForward,
  Pause,
  Ban,
  Trash2,
  AlertCircle,
  PlusCircle,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [agents, setAgents] = useState<AgentProfile[]>(AGENTS_LIST);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Modals
  const [isDirectiveModalOpen, setIsDirectiveModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedAgentDossier, setSelectedAgentDossier] = useState<AgentProfile | null>(null);

  // Active tab within the selected operation view
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMMS' | 'GROUNDING' | 'AUDIT' | 'REPORT'>('OVERVIEW');

  // Fetch health and operations
  const fetchOperationsAndHealth = useCallback(async () => {
    try {
      const [hRes, opRes, agRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/operations'),
        fetch('/api/agents'),
      ]);

      if (hRes.ok) {
        const hData = await hRes.json();
        setHealth(hData);
      }
      if (agRes.ok) {
        const agData = await agRes.json();
        setAgents(agData);
      }
      if (opRes.ok) {
        const opData: Operation[] = await opRes.json();
        setOperations(opData);
        // If no selected operation or previous selected op not in list, select the newest
        if (opData.length > 0 && (!selectedOpId || !opData.some(o => o.id === selectedOpId))) {
          setSelectedOpId(opData[0].id);
        }
      }
    } catch (err: any) {
      console.warn('API sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedOpId]);

  useEffect(() => {
    fetchOperationsAndHealth();
  }, [fetchOperationsAndHealth]);

  const selectedOperation = operations.find((o) => o.id === selectedOpId) || null;

  // Active agents executing current tasks
  const activeAgentCodes = selectedOperation
    ? selectedOperation.tasks
        .filter((t) => t.status === 'IN_PROGRESS')
        .map((t) => t.assignedAgent)
    : [];

  // Create new directive (Gemo plans it -> status AWAITING_APPROVAL)
  const handleCreateDirective = async (data: {
    objective: string;
    constraints?: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  }) => {
    try {
      setErrorNotice(null);
      const res = await fetch('/api/operations/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Plan oluşturulamadı.');
      }

      const newOp: Operation = await res.json();
      setOperations((prev) => [newOp, ...prev]);
      setSelectedOpId(newOp.id);
      setActiveTab('OVERVIEW');
    } catch (err: any) {
      setErrorNotice(err.message);
      throw err;
    }
  };

  // Commander approves the operation
  const handleApprove = async (opId: string) => {
    try {
      setErrorNotice(null);
      const res = await fetch(`/api/operations/${opId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commanderConfirmed: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Onay verilemedi.');
      }

      const updated: Operation = await res.json();
      setOperations((prev) => prev.map((o) => (o.id === opId ? updated : o)));
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  // Commander pauses the operation
  const handlePause = async (opId: string) => {
    try {
      const res = await fetch(`/api/operations/${opId}/pause`, { method: 'POST' });
      if (res.ok) {
        const updated: Operation = await res.json();
        setOperations((prev) => prev.map((o) => (o.id === opId ? updated : o)));
      }
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  // Commander cancels the operation
  const handleCancel = async (opId: string) => {
    try {
      const res = await fetch(`/api/operations/${opId}/cancel`, { method: 'POST' });
      if (res.ok) {
        const updated: Operation = await res.json();
        setOperations((prev) => prev.map((o) => (o.id === opId ? updated : o)));
      }
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  // Step: Execute next task
  const handleStep = async (opId: string) => {
    try {
      setExecuting(true);
      setErrorNotice(null);
      const res = await fetch(`/api/operations/${opId}/step`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Adım icrası başarısız.');
      }
      const updated: Operation = await res.json();
      setOperations((prev) => prev.map((o) => (o.id === opId ? updated : o)));
    } catch (err: any) {
      setErrorNotice(err.message);
    } finally {
      setExecuting(false);
    }
  };

  // Run all remaining tasks automatically
  const handleRunAll = async (opId: string) => {
    try {
      setExecuting(true);
      setErrorNotice(null);
      const res = await fetch(`/api/operations/${opId}/run-all`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Toplu icra başarısız.');
      }
      const updated: Operation = await res.json();
      setOperations((prev) => prev.map((o) => (o.id === opId ? updated : o)));
      if (updated.status === 'COMPLETED') {
        setActiveTab('REPORT');
      }
    } catch (err: any) {
      setErrorNotice(err.message);
    } finally {
      setExecuting(false);
    }
  };

  // Commander retries failed tasks in the operation
  const handleRetry = async (opId: string) => {
    try {
      setExecuting(true);
      setErrorNotice(null);
      const res = await fetch(`/api/operations/${opId}/retry`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Yeniden başlatma başarısız.');
      }
      const updated: Operation = await res.json();
      setOperations((prev) => prev.map((o) => (o.id === opId ? updated : o)));
      // Automatically trigger execution after resetting failed tasks
      await handleRunAll(opId);
    } catch (err: any) {
      setErrorNotice(err.message);
      setExecuting(false);
    }
  };

  // Delete operation (Requires explicit confirmation)
  const handleDelete = async (opId: string) => {
    const confirmed = window.confirm(
      'Komutan Kamil Teacher Onayı Gerekli: Bu operasyon kaydını kalıcı olarak silmek istediğinizden emin misiniz?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/operations/${opId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commanderConfirmed: true }),
      });

      if (res.ok) {
        setOperations((prev) => prev.filter((o) => o.id !== opId));
        if (selectedOpId === opId) {
          const remaining = operations.filter((o) => o.id !== opId);
          setSelectedOpId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  const getStatusBadge = (status: Operation['status']) => {
    switch (status) {
      case 'AWAITING_APPROVAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600 font-mono animate-pulse">
            KOMUTAN ONAYI BEKLİYOR
          </span>
        );
      case 'PLANNED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
            PLANLANDI
          </span>
        );
      case 'RUNNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 font-mono animate-pulse">
            İCRADA (UZMANLAR ÇALIŞIYOR)
          </span>
        );
      case 'INSPECTING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-600 font-mono animate-pulse">
            MÜFETTİŞ DENETİMİNDE
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 font-mono">
            KANI DAYALI TAMAMLANDI
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            DURDURULDU
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800 font-mono">
            İPTAL EDİLDİ
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-600 font-mono">
            BAŞARISIZ
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
            TASLAK
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Operations Header */}
      <Header
        health={health}
        onOpenNewDirective={() => setIsDirectiveModalOpen(true)}
        onOpenAgentsModal={() => setSelectedAgentDossier(agents[0])}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Error notification banner if any */}
        {errorNotice && (
          <div className="p-3.5 rounded-lg bg-red-950/70 border border-red-700/80 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-red-400 hover:text-white text-xs font-mono ml-4"
            >
              Kapat
            </button>
          </div>
        )}

        {/* 8 Agents Cadre Grid */}
        <AgentStatusGrid
          agents={agents}
          activeAgentCodes={activeAgentCodes}
          onSelectAgent={(agent) => setSelectedAgentDossier(agent)}
        />

        {/* Operations Center Workspace */}
        {operations.length === 0 ? (
          /* Empty state: Welcomes Commander Kamil Teacher with zero mock tasks */
          <div className="bg-[#0b101f] border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-3xl mx-auto my-8 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-600/40 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-mono text-slate-100">
                RÖH KOMUTA MERKEZİ HAZIR
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Hoş geldiniz Komutanım <strong className="text-amber-300">Kamil Teacher</strong>. Sistem, Baş Koordinatör <strong className="text-cyan-300">Gemo</strong> ve 7 uzman yapay zekâ ajanıyla teyakkuz halindedir. Güvenlik protokolü gereği sizin açık talimatınız olmadan hiçbir sahte veya örnek operasyon çalıştırılmaz.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsDirectiveModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg shadow-xl shadow-cyan-950/60 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>İLK OPERASYON TALİMATINI GİR</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Operation Selector Bar */}
            <div className="bg-[#0b101f] border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex-shrink-0">
                  Operasyonlar:
                </span>
                {operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      setSelectedOpId(op.id);
                      setActiveTab('OVERVIEW');
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer ${
                      selectedOpId === op.id
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{op.codeName}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        op.status === 'COMPLETED'
                          ? 'bg-emerald-400'
                          : op.status === 'AWAITING_APPROVAL'
                          ? 'bg-amber-400 animate-pulse'
                          : op.status === 'RUNNING'
                          ? 'bg-cyan-400 animate-pulse'
                          : 'bg-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={fetchOperationsAndHealth}
                  className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Operasyon durumlarını yenile"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsDirectiveModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Yeni Operasyon</span>
                </button>
              </div>
            </div>

            {selectedOperation && (
              <div className="space-y-6">
                
                {/* Approval Banner if waiting Commander approval */}
                {selectedOperation.status === 'AWAITING_APPROVAL' && (
                  <ApprovalGateBanner
                    operation={selectedOperation}
                    onApprove={handleApprove}
                    onCancel={handleCancel}
                  />
                )}

                {/* Operation War Room Header Card */}
                <div className="bg-[#0b101f] border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <h2 className="text-lg font-bold font-mono text-slate-100">
                          {selectedOperation.codeName}
                        </h2>
                        {getStatusBadge(selectedOperation.status)}
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                          Öncelik: <strong className="text-slate-300">{selectedOperation.priority}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        <strong>Hedef:</strong> {selectedOperation.objective}
                      </p>
                      {selectedOperation.constraints && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          <strong>Kısıtlamalar:</strong> {selectedOperation.constraints}
                        </p>
                      )}
                    </div>

                    {/* Operational Controls */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                      {/* Retry button if failed */}
                      {(selectedOperation.status === 'FAILED' || selectedOperation.tasks.some(t => t.status === 'FAILED')) && (
                        <button
                          onClick={() => handleRetry(selectedOperation.id)}
                          disabled={executing}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-600 rounded-md transition-colors cursor-pointer animate-pulse"
                          title="Hata veren görevi yeniden dene"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Yeniden Dene</span>
                        </button>
                      )}

                      {/* Step button */}
                      <button
                        onClick={() => handleStep(selectedOperation.id)}
                        disabled={
                          executing ||
                          selectedOperation.status === 'AWAITING_APPROVAL' ||
                          selectedOperation.status === 'COMPLETED' ||
                          selectedOperation.status === 'CANCELLED'
                        }
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md disabled:opacity-40 transition-colors cursor-pointer"
                        title="Sonraki hazır görevi icra et"
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tek Adım</span>
                      </button>

                      {/* Run All button */}
                      <button
                        onClick={() => handleRunAll(selectedOperation.id)}
                        disabled={
                          executing ||
                          selectedOperation.status === 'AWAITING_APPROVAL' ||
                          selectedOperation.status === 'COMPLETED' ||
                          selectedOperation.status === 'CANCELLED'
                        }
                        className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-md shadow-md shadow-emerald-950/40 disabled:opacity-40 transition-all cursor-pointer"
                        title="Tüm görevleri sırayla tamamla, Müfettiş denetiminden geçir ve nihai raporu üret"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>{executing ? 'İcrada...' : 'Tümünü İcra Et'}</span>
                      </button>

                      {/* Pause */}
                      {selectedOperation.status === 'RUNNING' && (
                        <button
                          onClick={() => handlePause(selectedOperation.id)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 rounded-md transition-colors"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Durdur</span>
                        </button>
                      )}

                      {/* Cancel */}
                      {selectedOperation.status !== 'COMPLETED' &&
                        selectedOperation.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(selectedOperation.id)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900 rounded-md transition-colors"
                          >
                            <Ban className="w-3 h-3" />
                            <span>İptal</span>
                          </button>
                        )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(selectedOperation.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
                        title="Operasyon kaydını sil (Komutan Onayı Gerektirir)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-slate-800/80 text-xs font-mono overflow-x-auto">
                    {[
                      { id: 'OVERVIEW', label: 'Görev Akışı (DAG)' },
                      { id: 'COMMS', label: `Telsiz Haberleşmesi (${selectedOperation.messages.length})` },
                      { id: 'GROUNDING', label: `Doğrulanmış Kaynaklar (${selectedOperation.groundingSources.length})` },
                      { id: 'AUDIT', label: 'Müfettiş Kalite Denetimi' },
                      { id: 'REPORT', label: 'Resmi Görev Raporu' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Views */}
                {activeTab === 'OVERVIEW' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <TaskDAGView tasks={selectedOperation.tasks} />
                      <InspectorAuditCard
                        audit={selectedOperation.inspectorAudit}
                        isRunning={selectedOperation.status === 'INSPECTING'}
                      />
                    </div>
                    <div className="space-y-6">
                      <InterAgentComms messages={selectedOperation.messages} />
                    </div>
                  </div>
                )}

                {activeTab === 'COMMS' && (
                  <InterAgentComms messages={selectedOperation.messages} />
                )}

                {activeTab === 'GROUNDING' && (
                  <GroundingSourcesView sources={selectedOperation.groundingSources} />
                )}

                {activeTab === 'AUDIT' && (
                  <InspectorAuditCard
                    audit={selectedOperation.inspectorAudit}
                    isRunning={selectedOperation.status === 'INSPECTING'}
                  />
                )}

                {activeTab === 'REPORT' && (
                  <OperationReportView operation={selectedOperation} />
                )}

              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060912] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RÖH — ROBOT ÖZEL HAREKÂT &bull; Çok Ajanlı Komuta ve Operasyon Sistemi</span>
          <span>Sistem Sahibi ve Tek Komutan: <strong className="text-slate-400">Kamil Teacher</strong></span>
        </div>
      </footer>

      {/* Modals */}
      <OperationDirectiveModal
        isOpen={isDirectiveModalOpen}
        onClose={() => setIsDirectiveModalOpen(false)}
        onSubmitDirective={handleCreateDirective}
      />

      <AgentDossierModal
        agent={selectedAgentDossier}
        onClose={() => setSelectedAgentDossier(null)}
      />

      <SecurityPanelModal
        isOpen={isSecurityModalOpen}
        health={health}
        onClose={() => setIsSecurityModalOpen(false)}
      />

    </div>
  );
}
