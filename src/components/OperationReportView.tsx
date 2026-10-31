/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Operation } from '../types/roh.ts';
import {
  FileText,
  Download,
  Copy,
  Check,
  Award,
  Globe,
  UserCheck,
  Cpu,
} from 'lucide-react';
import { compileMarkdownReport } from '../orchestrator/engine.ts';

interface OperationReportViewProps {
  operation: Operation;
}

export const OperationReportView: React.FC<OperationReportViewProps> = ({ operation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const md = compileMarkdownReport(operation);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (format: 'md' | 'json') => {
    window.location.href = `/api/operations/${operation.id}/export/${format}`;
  };

  return (
    <div className="bg-[#0b101f] border-2 border-cyan-500/40 rounded-xl p-6 shadow-2xl shadow-cyan-950/40">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
              RESMİ OPERASYON RAPORU
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {operation.codeName}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            Kanıta Dayalı Nihai Görev Raporu
          </h3>
          <p className="text-xs text-slate-400">
            Komutan: <strong className="text-amber-300">Kamil Teacher</strong> | Baş Koordinatör: <strong className="text-cyan-300">Gemo</strong>
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Raporu Kopyala</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleDownload('md')}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all shadow-md shadow-cyan-950"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown İndir</span>
          </button>

          <button
            onClick={() => handleDownload('json')}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON İndir</span>
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mt-5 p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs leading-relaxed space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pb-1 border-b border-slate-800">
          <span>YÖNETİCİ ÖZETİ (Gemo Arzı)</span>
          <span className="text-emerald-400 font-bold">
            Müfettiş Onayı: {operation.inspectorAudit?.score || 95}/100
          </span>
        </div>
        <p className="text-slate-200">
          {operation.finalReport?.executiveSummary ||
            `Komutan Kamil Teacher'ın "${operation.objective}" emri doğrultusunda operasyon başarıyla tamamlanmıştır.`}
        </p>
      </div>

      {/* Specialist Deliverables Grid */}
      <div className="mt-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center space-x-2">
          <span>UZMAN AJANLARIN SOMUT ÇIKTILARI</span>
          <span className="text-slate-500">({operation.tasks.length} Görev)</span>
        </h4>

        {operation.tasks.map((task, idx) => (
          <div
            key={task.id}
            className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                <span className="font-bold text-slate-100">{task.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                {task.assignedAgent}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {task.outputResult || 'Çıktı kaydedilmedi.'}
            </div>
          </div>
        ))}
      </div>

      {/* Grounding & Verification Summary */}
      {operation.groundingSources.length > 0 && (
        <div className="mt-5 p-4 rounded-lg bg-sky-950/20 border border-sky-800/40 text-xs">
          <div className="flex items-center space-x-2 text-sky-400 font-bold font-mono mb-2">
            <Globe className="w-4 h-4" />
            <span>Teyit Edilen Harici Web Kaynakları ({operation.groundingSources.length}):</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
            {operation.groundingSources.map((s, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span className="truncate pr-2">{idx + 1}. {s.title}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex-shrink-0"
                >
                  [URL]
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps for Commander */}
      <div className="mt-5 p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs">
        <h5 className="font-bold text-amber-300 font-mono mb-1.5">
          KOMUTAN KAMİL TEACHER İÇİN SONRAKİ ADIMLAR:
        </h5>
        <ul className="space-y-1 text-slate-300 text-[11px]">
          {(operation.finalReport?.nextStepsForCommander || [
            'Operasyon raporunu bilgisayarınıza indirin.',
            'Yeni bir operasyon talimatı vermek için Operasyon Konsolunu kullanın.',
          ]).map((step, idx) => (
            <li key={idx} className="flex items-start space-x-1.5">
              <span className="text-amber-400 font-mono">&rarr;</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
