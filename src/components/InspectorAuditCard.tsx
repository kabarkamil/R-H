/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InspectorAudit } from '../types/roh.ts';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface InspectorAuditCardProps {
  audit?: InspectorAudit;
  isRunning?: boolean;
}

export const InspectorAuditCard: React.FC<InspectorAuditCardProps> = ({
  audit,
  isRunning,
}) => {
  if (isRunning) {
    return (
      <div className="bg-[#0b101f] border border-cyan-800/80 rounded-xl p-6 text-center animate-pulse">
        <div className="flex items-center justify-center space-x-2 text-cyan-400 font-mono text-sm font-bold mb-2">
          <ShieldAlert className="w-5 h-5 animate-spin" />
          <span>MÜFETTİŞ BAĞIMSIZ KALİTE DENETİMİ İCRADA...</span>
        </div>
        <p className="text-xs text-slate-400">
          Uzman ajanların ürettiği tüm çıktılar, kanıt güvenilirliği ve komutan emrine uyum yönünden taranıyor.
        </p>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="bg-[#0b101f] border border-slate-800 rounded-xl p-5 text-center text-slate-500 text-xs font-mono">
        <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-slate-600" />
        Henüz Müfettiş denetimi başlatılmadı. Tüm uzman görevleri tamamlandığında bağımsız denetim otomatik olarak yürütülür.
      </div>
    );
  }

  const getVerdictStyle = () => {
    switch (audit.verdict) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/60',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-600',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
      case 'REVISION_REQUIRED':
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/60',
          text: 'text-amber-400',
          badge: 'bg-amber-950 text-amber-300 border-amber-600',
          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-red-950/40',
          border: 'border-red-500/60',
          text: 'text-red-400',
          badge: 'bg-red-950 text-red-300 border-red-600',
          icon: <ShieldX className="w-6 h-6 text-red-400" />,
        };
    }
  };

  const style = getVerdictStyle();

  return (
    <div className={`rounded-xl border-2 p-5 ${style.bg} ${style.border} shadow-lg shadow-black/40`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            {style.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono tracking-widest uppercase ${style.badge}`}>
                {audit.verdictTr}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                BAĞIMSIZ KALİTE DENETİMİ
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 mt-1">
              Müfettiş Nihai Denetim Raporu
            </h4>
          </div>
        </div>

        {/* Big Score Stamp */}
        <div className="flex items-center space-x-3 self-end sm:self-center bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-800">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Kalite Puanı
            </div>
            <div className="text-xl font-black font-mono text-slate-100">
              <span className={style.text}>{audit.score}</span>
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-300 mt-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
        {audit.summary}
      </p>

      {/* 5 Criteria Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          { label: 'Kanıt & Kaynak', score: audit.criteriaScores.factualGrounding },
          { label: 'Komutan Emrine Uyum', score: audit.criteriaScores.directiveFulfillment },
          { label: 'Uydurma Yokluğu', score: audit.criteriaScores.hallucinationCheck },
          { label: 'Teknik Doğruluk', score: audit.criteriaScores.technicalQuality },
          { label: 'Uygulanabilirlik', score: audit.criteriaScores.actionability },
        ].map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-mono truncate">{item.label}</div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-1">
              <span className={item.score >= 80 ? 'text-emerald-400' : item.score >= 60 ? 'text-amber-400' : 'text-red-400'}>
                {item.score}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">/100</span>
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Concerns */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {audit.strengths.length > 0 && (
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold font-mono mb-1.5 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Güçlü Yönler:</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {audit.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-500 font-mono">&bull;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {audit.concernsOrFlaws.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold font-mono mb-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>İkazlar & Kusurlar:</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {audit.concernsOrFlaws.map((c, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-amber-500 font-mono">&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
