/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Operation } from '../types/roh.ts';
import { ShieldCheck, UserCheck, Check, Ban, AlertCircle, ArrowRight } from 'lucide-react';
import { AGENT_REGISTRY } from '../orchestrator/agents.ts';

interface ApprovalGateBannerProps {
  operation: Operation;
  onApprove: (opId: string) => Promise<void>;
  onCancel: (opId: string) => Promise<void>;
}

export const ApprovalGateBanner: React.FC<ApprovalGateBannerProps> = ({
  operation,
  onApprove,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await onApprove(operation.id);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await onCancel(operation.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-[#0d1424] to-cyan-950/40 border-2 border-amber-500/60 rounded-xl p-5 shadow-xl shadow-black/50 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-500/30">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                KOMUTAN ONAYI BEKLENİYOR
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {operation.codeName}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Sayın Komutanım Kamil Teacher, Gemo operasyon planını hazırladı
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              Hedef: <span className="text-amber-200 font-medium">&ldquo;{operation.objective}&rdquo;</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 self-end lg:self-center">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 rounded-md transition-colors cursor-pointer"
          >
            <Ban className="w-4 h-4 text-red-400" />
            <span>Reddet / İptal Et</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-md shadow-lg shadow-amber-950/60 transition-all cursor-pointer transform active:scale-95"
          >
            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>KOMUTAN OLARAK ONAYLA VE BAŞLAT</span>
          </button>
        </div>
      </div>

      {/* Task Plan Preview */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>GÖREV DAĞILIMI VE UZMAN EŞLEŞTİRMESİ ({operation.tasks.length} Görev)</span>
          <span className="text-amber-400/90 text-[11px]">
            Hiyerarşik Kural: Onayınız olmadan hiçbir ajan başlatılamaz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {operation.tasks.map((task, idx) => {
            const agent = AGENT_REGISTRY[task.assignedAgent];
            return (
              <div
                key={task.id}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      AŞAMA #{idx + 1}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                      style={{
                        backgroundColor: agent ? agent.accentBg : '#1e293b',
                        color: agent ? agent.color : '#cbd5e1',
                        border: `1px solid ${agent ? agent.borderAccent : '#334155'}`,
                      }}
                    >
                      {agent?.name || task.assignedAgent}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>
                    {task.dependencies.length > 0
                      ? `Bağımlılık: ${task.dependencies.join(', ')}`
                      : 'Bağımsız İlk Görev'}
                  </span>
                  {task.requiresGrounding && (
                    <span className="text-sky-400 font-bold">Search Grounding</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
