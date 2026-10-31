/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InterAgentMessage, MessageType } from '../types/roh.ts';
import { AGENT_REGISTRY } from '../orchestrator/agents.ts';
import { Radio, ArrowRight, Filter, MessageSquare, Terminal } from 'lucide-react';

interface InterAgentCommsProps {
  messages: InterAgentMessage[];
}

export const InterAgentComms: React.FC<InterAgentCommsProps> = ({ messages }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredMessages = messages.filter((msg) => {
    if (filterType === 'ALL') return true;
    return msg.type === filterType;
  });

  const getSenderBadge = (sender: string) => {
    if (sender === 'KOMUTAN_KAMIL_TEACHER') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60 font-mono">
          KOMUTAN (Kamil Teacher)
        </span>
      );
    }
    const agent = AGENT_REGISTRY[sender as keyof typeof AGENT_REGISTRY];
    if (agent) {
      return (
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
          style={{
            backgroundColor: agent.accentBg,
            color: agent.color,
            border: `1px solid ${agent.borderAccent}`,
          }}
        >
          {agent.name}
        </span>
      );
    }
    return <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400">{sender}</span>;
  };

  const getRecipientBadge = (recipient: string) => {
    if (recipient === 'KOMUTAN_KAMIL_TEACHER') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60 font-mono">
          KOMUTAN (Kamil Teacher)
        </span>
      );
    }
    if (recipient === 'ALL') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
          TÜM KADRO
        </span>
      );
    }
    const agent = AGENT_REGISTRY[recipient as keyof typeof AGENT_REGISTRY];
    if (agent) {
      return (
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
          style={{
            backgroundColor: agent.accentBg,
            color: agent.color,
            border: `1px solid ${agent.borderAccent}`,
          }}
        >
          {agent.name}
        </span>
      );
    }
    return <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400">{recipient}</span>;
  };

  const getTypeBadge = (type: MessageType) => {
    switch (type) {
      case 'COMMANDER_ORDER':
        return 'text-amber-400 border-amber-800 bg-amber-950/50';
      case 'PLAN_PROPOSAL':
        return 'text-cyan-400 border-cyan-800 bg-cyan-950/50';
      case 'TASK_ASSIGNMENT':
        return 'text-sky-400 border-sky-800 bg-sky-950/50';
      case 'INSPECTION_REQUEST':
      case 'INSPECTION_RESULT':
        return 'text-red-400 border-red-800 bg-red-950/50';
      case 'RESPONSE':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/50';
      default:
        return 'text-slate-400 border-slate-800 bg-slate-900';
    }
  };

  return (
    <div className="bg-[#0b101f] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            AJANLAR ARASI TELSİZ VE HABERLEŞME AKIŞI
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
            {messages.length} İleti
          </span>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tüm İletiler</option>
            <option value="COMMANDER_ORDER">Komutan Emirleri</option>
            <option value="PLAN_PROPOSAL">Plan Önerileri</option>
            <option value="TASK_ASSIGNMENT">Görev Dağıtımı</option>
            <option value="RESPONSE">Ajan Yanıtları</option>
            <option value="INSPECTION_REQUEST">Denetim Talepleri</option>
            <option value="INSPECTION_RESULT">Denetim Raporları</option>
          </select>
        </div>
      </div>

      {/* Message List */}
      <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1.5 custom-scrollbar">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            Bu operasyon için henüz mesaj kaydı bulunmuyor.
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              {/* Message Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60 text-[11px]">
                <div className="flex items-center space-x-2">
                  {getSenderBadge(msg.fromAgent)}
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  {getRecipientBadge(msg.toAgent)}
                </div>

                <div className="flex items-center space-x-2 font-mono">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${getTypeBadge(
                      msg.type
                    )}`}
                  >
                    {msg.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Title & Content */}
              <div className="text-xs font-bold text-slate-200 mb-1 font-mono">
                {msg.title}
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {msg.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
