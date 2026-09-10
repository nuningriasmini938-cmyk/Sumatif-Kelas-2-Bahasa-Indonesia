import React from 'react';
import { BookOpen, ShieldCheck, GraduationCap } from 'lucide-react';

interface NavbarProps {
  onOpenTeacherPanel: () => void;
  activeStep: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTeacherPanel, activeStep }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* School Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
              SD NEGERI 3 LOLOAN TIMUR
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span>Kelas II</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-blue-600 font-semibold">Bahasa Indonesia</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="hidden sm:inline">Menjaga Kesehatan</span>
            </p>
          </div>
        </div>

        {/* Right side: Step pill & Admin Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeStep === 2 && (
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Sedang Mengerjakan Ujian
            </span>
          )}

          <button
            id="btn-teacher-panel"
            onClick={onOpenTeacherPanel}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Panel Guru & Rekap Nilai"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Panel Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
