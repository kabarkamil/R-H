/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

interface OperationDirectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDirective: (data: {
    objective: string;
    constraints?: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  }) => Promise<void>;
}

export const OperationDirectiveModal: React.FC<OperationDirectiveModalProps> = ({
  isOpen,
  onClose,
  onSubmitDirective,
}) => {
  const [objective, setObjective] = useState('');
  const [constraints, setConstraints] = useState('');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('HIGH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) {
      setError('Lütfen operasyon hedefini eksiksiz giriniz.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitDirective({
        objective: objective.trim(),
        constraints: constraints.trim() || undefined,
        priority,
      });
      setObjective('');
      setConstraints('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operasyon planlanırken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0b101f] border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                KOMUTAN TALİMATI GİRİŞİ
              </h3>
              <p className="text-xs text-slate-400">
                Komutan Kamil Teacher &rarr; Baş Koordinatör Gemo
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

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-md bg-red-950/60 border border-red-700/80 text-red-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Commander Authority Notice */}
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/50 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-mono block mb-1">
              KOMUTA HİYERARŞİSİ PROTOKOLÜ:
            </strong>
            Girdiğiniz bu talimat doğrudan Baş Koordinatör <strong>Gemo</strong>&apos;ya iletilecektir. Gemo, talimatınızı analiz edip uzman ajanlar (Dedektif, Analist, Mühendis, Kreatif, Yazar, Turk) için görev planı oluşturacaktır. <strong>Sizin açık onayınız verilmeden hiçbir ajan faaliyete geçmeyecektir.</strong>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Operasyon Hedefi ve Detayları <span className="text-red-400">*</span>
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Örn: Yeni nesil yapay zekâ ajan mimarilerini araştır, teknik risklerini ve avantajlarını analiz et, ardından sistem mimarisini ve örnek kodlarını hazırla..."
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Operasyonel Kısıtlamalar ve Özel Kurallar (İsteğe Bağlı)
            </label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Örn: Yalnızca son 6 aya ait resmî kaynaklar kullanılsın, uydurma kaynak içermesin, Müfettiş denetimi sıkı tutulsun..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Operasyonel Öncelik Seviyesi
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { id: 'NORMAL', label: 'NORMAL', desc: 'Standart icra akışı' },
                  { id: 'HIGH', label: 'YÜKSEK', desc: 'Öncelikli operasyon' },
                  { id: 'CRITICAL', label: 'KRİTİK', desc: 'Acil stratejik görev' },
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`p-2.5 rounded-md border text-left cursor-pointer transition-all ${
                    priority === p.id
                      ? p.id === 'CRITICAL'
                        ? 'bg-red-950/60 border-red-500 text-red-200'
                        : 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{p.label}</div>
                  <div className="text-[10px] opacity-80">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting || !objective.trim()}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-bold tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-md shadow-lg shadow-cyan-950 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <span>Gemo Planlıyor...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>GEMO&apos;YA TALİMATI İLET</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
