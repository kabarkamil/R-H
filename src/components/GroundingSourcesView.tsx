/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GroundingSource } from '../types/roh.ts';
import { Globe, ExternalLink, ShieldCheck, AlertCircle, Search } from 'lucide-react';

interface GroundingSourcesViewProps {
  sources: GroundingSource[];
}

export const GroundingSourcesView: React.FC<GroundingSourcesViewProps> = ({ sources }) => {
  return (
    <div className="bg-[#0b101f] border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            DOĞRULANMIŞ WEB KAYNAKLARI (GOOGLE SEARCH GROUNDING)
          </h3>
        </div>
        <span className="text-[11px] text-sky-400 font-mono font-bold">
          {sources.length} Doğrulanmış Kaynak
        </span>
      </div>

      {sources.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-xs font-mono bg-slate-950/40 rounded-lg border border-slate-900">
          <Search className="w-5 h-5 mx-auto mb-2 text-slate-600" />
          Bu operasyonda henüz web araması yürütülmedi veya harici kaynak gerekmedi. Dedektif görevi icra edildiğinde gerçek kaynak URL&apos;leri buraya listelenir.
        </div>
      ) : (
        <div className="space-y-2.5">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-sky-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
            >
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded bg-sky-950 border border-sky-800 flex items-center justify-center text-[10px] font-mono text-sky-300 font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                    {src.title}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-mono">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>DOĞRULANDI</span>
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate pl-6">
                  {src.url}
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  {new Date(src.retrievedAt).toLocaleTimeString('tr-TR')}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-sky-400 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/80 rounded transition-colors"
                >
                  <span>Kaynağa Git</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}

          {/* Research boundary notice */}
          <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>İstihbarat Sınırı Notu:</strong> Google Search Grounding ile alınan bağlantılar doğrudan Gemini API yanıtından filtrelenmiştir. RÖH güvenlik protokolü gereği hiçbir kaynak uydurulmaz veya değiştirilmez.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
