/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Radio, UserCheck, Cpu, PlusCircle, Users, Lock, Activity } from 'lucide-react';
import { SystemHealth } from '../types/roh.ts';

interface HeaderProps {
  health: SystemHealth | null;
  onOpenNewDirective: () => void;
  onOpenAgentsModal: () => void;
  onOpenSecurityModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onOpenNewDirective,
  onOpenAgentsModal,
  onOpenSecurityModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#090d18] sticky top-0 z-30 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & System Identity */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Shield className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-wider text-slate-100 font-mono">
                  RÖH
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                  ROBOT ÖZEL HAREKÂT
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide">
                Çok Ajanlı Yapay Zekâ Komuta ve Operasyon Merkezi
              </p>
            </div>
          </div>

          {/* Commander & Coordinator Badges */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Commander Kamil Teacher */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-md bg-amber-950/30 border border-amber-600/40 text-amber-200">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold">
                  Sistem Sahibi ve Tek Komutan
                </div>
                <div className="text-xs font-semibold text-amber-100 font-mono">
                  Kamil Teacher
                </div>
              </div>
            </div>

            {/* Coordinator Gemo */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-md bg-cyan-950/40 border border-cyan-600/40 text-cyan-200">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-widest text-cyan-400/80 font-bold">
                  Baş Koordinatör
                </div>
                <div className="text-xs font-semibold text-cyan-100 font-mono">
                  Gemo
                </div>
              </div>
            </div>

            {/* Live Status Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-medium">
                GÜVENLİ HAT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAgentsModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors"
              title="Ajan kadrosunu ve sistem talimatlarını incele"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ajan Kadrosu</span>
            </button>

            <button
              onClick={onOpenSecurityModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors"
              title="Güvenlik protokolleri ve yetki durumu"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Güvenlik & İzinler</span>
            </button>

            <button
              onClick={onOpenNewDirective}
              className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-md shadow-md shadow-cyan-950/50 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>YENİ OPERASYON</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
