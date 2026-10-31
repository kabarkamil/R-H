/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldAlert, Lock, CheckCircle2, AlertOctagon, Key, Database, Globe } from 'lucide-react';
import { SystemHealth } from '../types/roh.ts';

interface SecurityPanelModalProps {
  isOpen: boolean;
  health: SystemHealth | null;
  onClose: () => void;
}

export const SecurityPanelModal: React.FC<SecurityPanelModalProps> = ({
  isOpen,
  health,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0b101f] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/60 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                RÖH GÜVENLİK VE YETKİLENDİRME PROTOKOLÜ
              </h3>
              <p className="text-xs text-slate-400">
                Tek Komuta Otoritesi: Kamil Teacher
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
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
              <Key className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200 font-mono">Sunucu Tarafı Gemini API</div>
                <div className="text-slate-400 mt-0.5">
                  {health?.geminiApiKeyConfigured ? (
                    <span className="text-emerald-400 font-semibold">&bull; API Anahtarı Tanımlı ve Güvende</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">&bull; Anahtar Bekleniyor / Güvenli Mod</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">İstemci tarafına asla sızdırılmaz.</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
              <Globe className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200 font-mono">Google Search Grounding</div>
                <div className="text-emerald-400 font-semibold mt-0.5">
                  &bull; Gerçek URL Filtreleme Aktif
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Yalnızca doğrulanmış arama referansları.</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
              <Database className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200 font-mono">Kalıcı Operasyon Belleği</div>
                <div className="text-emerald-400 font-semibold mt-0.5">
                  &bull; Sunucu Disk Deposu Aktif
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Görevler ve mesajlar kalıcı saklanır.</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-3">
              <AlertOctagon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200 font-mono">Dış Sistem İzinleri</div>
                <div className="text-amber-400 font-semibold mt-0.5">
                  &bull; Sıfır Yetki (İzin Gerektirir)
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Kullanıcı onaysız harici işlem engellidir.</div>
              </div>
            </div>
          </div>

          {/* Golden Rules */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 font-mono text-[11px] uppercase tracking-wider text-amber-400">
              KOMUTANIN DEĞİŞTİRİLEMEZ 5 EMRİ:
            </h4>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed font-mono text-[11px]">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>1. Komutan Kamil Teacher&apos;ın açık onayı olmadan hiçbir operasyon başlatılamaz veya dış servis tetiklenemez.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>2. Gerçekte yapılamayan veya uydurma kaynak içeren bir iş kesinlikle yapılmış gibi gösterilemez.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>3. Tüm uzman ajan çıktıları Müfettiş bağımsız kalite denetiminden geçmek zorundadır.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>4. Dosya silme, kod yayımlama veya harici veri aktarımı gibi işlemler ayrı teyit ister.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>5. Kullanıcı istemedikçe sahte veya örnek operasyon geçmişe eklenmez.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080d1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Anlaşıldı
          </button>
        </div>

      </div>
    </div>
  );
};
