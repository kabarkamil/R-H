/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AgentProfile, AgentCode } from '../types/roh.ts';
import {
  ShieldAlert,
  Search,
  LineChart,
  Code2,
  Palette,
  FileText,
  Languages,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AgentStatusGridProps {
  agents: AgentProfile[];
  activeAgentCodes?: AgentCode[];
  onSelectAgent: (agent: AgentProfile) => void;
}

export const AgentStatusGrid: React.FC<AgentStatusGridProps> = ({
  agents,
  activeAgentCodes = [],
  onSelectAgent,
}) => {
  const getAgentIcon = (code: AgentCode) => {
    switch (code) {
      case 'GEMO':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 'DEDEKTIF':
        return <Search className="w-4 h-4 text-sky-400" />;
      case 'ANALIST':
        return <LineChart className="w-4 h-4 text-indigo-400" />;
      case 'MUHENDIS':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'KREATIF':
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 'YAZAR':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'TURK':
        return <Languages className="w-4 h-4 text-purple-400" />;
      case 'MUFETTIS':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-[#0b101f] border border-slate-800/90 rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            RÖH ÖZEL KADROSU (8 UZMAN AJAN)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Tek Amir: Kamil Teacher
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {agents.map((agent) => {
          const isWorking = activeAgentCodes.includes(agent.code);
          return (
            <button
              key={agent.code}
              onClick={() => onSelectAgent(agent)}
              className={`text-left p-2.5 rounded-md border transition-all relative group cursor-pointer ${
                isWorking
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1 rounded bg-slate-950 border border-slate-800">
                  {getAgentIcon(agent.code)}
                </div>
                {isWorking ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
                    GÖREVDE
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[9px] font-mono text-slate-400">
                    HAZIR
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                {agent.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {agent.role.split(' ')[0]}
              </div>
              
              <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono border-t border-slate-800/80 pt-1">
                <span className="truncate">{agent.callsign.split('/')[1]?.trim() || agent.code}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
