import React, { useState } from 'react';
import { StudentIdentity } from '../types';
import { User, Hash, Play, BookOpen, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudentIdentityStepProps {
  onStartExam: (identity: StudentIdentity) => void;
  initialIdentity?: StudentIdentity;
}

export const StudentIdentityStep: React.FC<StudentIdentityStepProps> = ({
  onStartExam,
  initialIdentity,
}) => {
  const [fullName, setFullName] = useState(initialIdentity?.fullName || '');
  const [absentNumber, setAbsentNumber] = useState(initialIdentity?.absentNumber || '');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Silakan isi Nama Lengkap terlebih dahulu!');
      return;
    }

    if (!absentNumber.trim()) {
      setErrorMessage('Silakan isi atau pilih Nomor Absen terlebih dahulu!');
      return;
    }

    setErrorMessage('');
    onStartExam({
      fullName: fullName.trim(),
      absentNumber: absentNumber.trim(),
      grade: 'II',
      school: 'SD NEGERI 3 LOLOAN TIMUR',
      subject: 'Bahasa Indonesia',
      theme: 'Menjaga Kesehatan',
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Banner / Card Pengantar */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Tahap 1 • Identitas Siswa
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Tes Sumatif Bahasa Indonesia
          </h2>
          <p className="text-blue-100 text-sm sm:text-base font-normal mb-4">
            Materi: <span className="font-semibold text-white">Menjaga Kesehatan</span> • Kelas II
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs pt-3 border-t border-white/20">
            <div className="bg-white/10 rounded-lg p-2.5">
              <span className="text-blue-200 block">Satuan Pendidikan</span>
              <span className="font-bold text-white">SDN 3 Loloan Timur</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5">
              <span className="text-blue-200 block">Total Soal</span>
              <span className="font-bold text-white">35 Butir Soal</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5">
              <span className="text-blue-200 block">Standar KKTP</span>
              <span className="font-bold text-white">Nilai 70</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5">
              <span className="text-blue-200 block">Jenis Soal</span>
              <span className="font-bold text-white">4 Variasi Soal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Identitas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Data Identitas Siswa
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Harap isi nama lengkap dan nomor absenmu dengan benar sebelum memulai ujian.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 animate-shake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kolom Nama Lengkap */}
          <div>
            <label
              htmlFor="student-full-name"
              className="block text-sm font-bold text-slate-800 mb-1.5"
            >
              Nama Lengkap Siswa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                id="student-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Putu Arya Nugraha"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Kolom Nomor Absen */}
          <div>
            <label
              htmlFor="student-absent-number"
              className="block text-sm font-bold text-slate-800 mb-1.5"
            >
              Nomor Absen <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-5 h-5" />
              </div>
              <input
                id="student-absent-number"
                type="number"
                min="1"
                max="50"
                required
                value={absentNumber}
                onChange={(e) => setAbsentNumber(e.target.value)}
                placeholder="Contoh: 15"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Masukkan angka nomor absenmu di kelas.</p>
          </div>

          {/* Petunjuk Singkat Pengerjaan */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-900 mb-1.5">
              <Heart className="w-4 h-4 text-amber-600" />
              Petunjuk Menjawab untuk Siswa Kelas II:
            </h4>
            <ul className="space-y-1 text-amber-800 text-xs list-disc list-inside">
              <li>Pilihan Ganda: Sentuh 1 pilihan jawaban yang paling benar (A, B, atau C).</li>
              <li>Pilihan Ganda Kompleks: Beri tanda centang pada lebih dari satu jawaban yang benar.</li>
              <li>Kategori: Pilih Benar/Salah, Setuju/Tidak Setuju, atau Sesuai/Tidak Sesuai.</li>
              <li>Isian Singkat: Ketik kata jawabanmu dengan rapi di kotak yang disediakan.</li>
              <li>Seluruh 35 butir soal harus dijawab sebelum mengirimkan tes.</li>
            </ul>
          </div>

          {/* Tombol Mulai Tes */}
          <div className="pt-2">
            <button
              id="btn-start-exam"
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai Mengerjakan Tes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
