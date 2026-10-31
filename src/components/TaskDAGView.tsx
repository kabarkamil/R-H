/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OperationTask } from '../types/roh.ts';
import { AGENT_REGISTRY } from '../orchestrator/agents.ts';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  FileSearch,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TaskDAGViewProps {
  tasks: OperationTask[];
}

export const TaskDAGView: React.FC<TaskDAGViewProps> = ({ tasks }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const getStatusBadge = (status: OperationTask['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>TAMAMLANDI</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
            <PlayCircle className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>ÇALIŞIYOR</span>
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>İCRAYA HAZIR</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>BAŞARISIZ</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
            <span>BEKLEMEDE</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0b101f] border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <FileSearch className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            OPERASYONEL GÖREV AKIŞI VE BAĞIMLILIKLAR (DAG)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {tasks.filter(t => t.status === 'COMPLETED').length} / {tasks.length} Görev Tamamlandı
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const agent = AGENT_REGISTRY[task.assignedAgent];
          const isExpanded = expandedTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`rounded-lg border transition-all ${
                task.status === 'IN_PROGRESS'
                  ? 'bg-slate-900/90 border-cyan-500 shadow-md shadow-cyan-950/40'
                  : task.status === 'COMPLETED'
                  ? 'bg-slate-900/50 border-slate-800/90'
                  : 'bg-slate-950/40 border-slate-900'
              }`}
            >
              <div
                onClick={() => toggleExpand(task.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-100">
                        {task.title}
                      </span>
                      {task.requiresGrounding && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                          Search Grounding
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono hidden sm:inline"
                    style={{
                      backgroundColor: agent ? agent.accentBg : '#1e293b',
                      color: agent ? agent.color : '#cbd5e1',
                      border: `1px solid ${agent ? agent.borderAccent : '#334155'}`,
                    }}
                  >
                    {agent?.name || task.assignedAgent}
                  </span>

                  {getStatusBadge(task.status)}

                  <button className="text-slate-400 hover:text-slate-200">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible details & deliverable preview */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/60 text-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                      Görev Detayı ve Beklenen Çıktı:
                    </span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      {task.description}
                    </p>
                  </div>

                  {task.dependencies.length > 0 && (
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                      <span>Önkoşul Görevler:</span>
                      <span className="text-cyan-400">{task.dependencies.join(', ')}</span>
                    </div>
                  )}

                  {task.outputResult && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                          Uzman Çıktısı ({agent?.name}):
                        </span>
                        {task.completedAt && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Tamamlandı: {new Date(task.completedAt).toLocaleTimeString('tr-TR')}
                          </span>
                        )}
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                        {task.outputResult}
                      </div>
                    </div>
                  )}

                  {task.groundingSources && task.groundingSources.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono block mb-1.5">
                        Doğrulanmış Web Kaynakları ({task.groundingSources.length}):
                      </span>
                      <div className="space-y-1.5">
                        {task.groundingSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-sky-300 hover:text-sky-200 text-xs transition-colors group"
                          >
                            <span className="truncate pr-2 font-mono">{src.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 group-hover:text-sky-300" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
