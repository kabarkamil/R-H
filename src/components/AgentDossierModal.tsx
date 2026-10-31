/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AgentProfile } from '../types/roh.ts';
import { X, Shield, Terminal, Wrench, CheckCircle } from 'lucide-react';

interface AgentDossierModalProps {
  agent: AgentProfile | null;
  onClose: () => void;
}

export const AgentDossierModal: React.FC<AgentDossierModalProps> = ({
  agent,
  onClose,
}) => {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0b101f] border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center space-x-3">
            <div
              className="p-2.5 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: agent.accentBg,
                borderColor: agent.borderAccent,
                color: agent.color,
              }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  {agent.name}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {agent.callsign}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {agent.role} &bull; <span className="font-mono">{agent.rank}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Specialization */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
              Uzmanlık Alanı ve Kapsamı
            </h4>
            <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {agent.specialization}
            </p>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
              Operasyonel Rolü
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {agent.description}
            </p>
          </div>

          {/* Authorized Tools */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yetkili Araçlar ve İzinler</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono text-xs flex items-center space-x-1"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          </div>

          {/* System Instruction */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Resmi Sistem Talimatı (System Instruction)</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {agent.systemInstruction}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080d1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
