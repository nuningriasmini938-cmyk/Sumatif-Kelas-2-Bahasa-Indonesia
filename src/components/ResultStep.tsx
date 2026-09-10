import React, { useEffect, useState } from 'react';
import { StudentSubmission, TeacherSettings, Question } from '../types';
import { ExamEvaluationResult } from '../utils/scoring';
import { generateStudentResultPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Download,
  RotateCcw,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Calendar,
  Sparkles,
  School,
} from 'lucide-react';

interface ResultStepProps {
  submission: StudentSubmission;
  evaluation: ExamEvaluationResult;
  questions: Question[];
  teacherSettings: TeacherSettings;
  onRetakeExam: () => void;
}

export const ResultStep: React.FC<ResultStepProps> = ({
  submission,
  evaluation,
  questions,
  teacherSettings,
  onRetakeExam,
}) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const isPassed = submission.status === 'Lulus';

  // Trigger celebration confetti if student passes
  useEffect(() => {
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isPassed]);

  const handleDownloadPDF = () => {
    generateStudentResultPDF(submission);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4">
      {/* Top Banner / Card Hasil */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden text-center ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700'
            : 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600'
        }`}
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-3">
          <Trophy className="w-4 h-4" />
          Tahap 3 • Laporan Hasil Evaluasi
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {isPassed ? 'Selamat, Kamu Lulus!' : 'Tetap Semangat Belajar!'}
        </h2>
        <p className="text-white/90 text-sm sm:text-base max-w-md mx-auto mb-6">
          {isPassed
            ? 'Hebat sekali! Kamu berhasil mencapai kriteria kelulusan materi Menjaga Kesehatan dengan baik.'
            : 'Nilaimu belum mencapai batas kelulusan KKTP (70). Jangan berkecil hati, ayo rajin belajar lagi ya!'}
        </p>

        {/* Big Score Display */}
        <div className="inline-block bg-white text-slate-900 rounded-2xl px-8 py-5 shadow-2xl mb-4 transform hover:scale-105 transition-transform">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
            Nilai Akhir Ujian
          </span>
          <div className="text-5xl sm:text-6xl font-black text-slate-900 leading-none my-1">
            <span className={isPassed ? 'text-emerald-600' : 'text-amber-600'}>
              {submission.finalScore}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400">/100</span>
          </div>
          <span
            className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {submission.status} (KKTP 70)
          </span>
        </div>
      </div>

      {/* Grid: Identitas Siswa & Ringkasan Capaian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Identitas Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-blue-600" />
            Identitas Peserta Ujian
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Nama Siswa</span>
              <span className="font-bold text-slate-900">{submission.studentName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Nomor Absen</span>
              <span className="font-bold text-slate-900">{submission.absentNumber}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Kelas</span>
              <span className="font-bold text-slate-900">{submission.grade}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Sekolah</span>
              <span className="font-bold text-slate-900">{submission.school}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Waktu Tes Selesai</span>
              <span className="font-medium text-slate-700 text-xs">{submission.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Ringkasan Skor Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Statistik Jawaban
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-emerald-800 font-semibold block">Jawaban Benar</span>
                  <span className="text-xl font-black text-emerald-950">
                    {submission.correctCount} Soal
                  </span>
                </div>
              </div>

              <div className="bg-rose-50 rounded-xl p-3.5 border border-rose-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-rose-800 font-semibold block">Jawaban Salah</span>
                  <span className="text-xl font-black text-rose-950">
                    {submission.incorrectCount} Soal
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              * Data hasil evaluasi ini telah otomatis direkam ke dalam <strong>Panel Guru</strong>{' '}
              untuk rekapitulasi nilai kelas.
            </p>
          </div>

          {/* Sync indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tersimpan di database lokal & Panel Guru</span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi: Unduh PDF & Kerjakan Ulang */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
        <button
          id="btn-download-result-pdf"
          type="button"
          onClick={handleDownloadPDF}
          className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Unduh Surat Hasil Nilai (PDF)</span>
        </button>

        <button
          id="btn-retake-exam"
          type="button"
          onClick={onRetakeExam}
          className="py-3 px-6 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base shadow-xs transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Ulangi Tes Baru</span>
        </button>
      </div>

      {/* Bagian Pembahasan & Kunci Jawaban (Controlled by Teacher Setting) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Kunci Jawaban & Pembahasan Soal
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review materi pembelajaran untuk siswa kelas 2 SD.
            </p>
          </div>

          {teacherSettings.showAnswerKeyToStudent && (
            <button
              type="button"
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
            >
              {showAnswerKey ? (
                <>
                  <span>Tutup Pembahasan</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Lihat Pembahasan ({evaluation.itemResults.length} Soal)</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Condition 1: Teacher has locked answer key (Mandatory condition: "Jangan tampilkan kunci jawaban kepada siswa kecuali saya mengaktifkan fitur tersebut.") */}
        {!teacherSettings.showAnswerKeyToStudent ? (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-800 mb-1">
              Kunci Jawaban Dikunci oleh Guru
            </h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Sesuai kebijakan ujian sekolah, kunci jawaban dan pembahasan saat ini tidak ditampilkan kepada siswa. Guru dapat membuka kunci jawaban melalui <strong>Panel Guru</strong>.
            </p>
          </div>
        ) : showAnswerKey ? (
          /* Condition 2: Teacher has enabled answer key, user expanded it */
          <div className="space-y-4 pt-2">
            {evaluation.itemResults.map((item) => {
              const q = questions.find((ques) => ques.id === item.questionId);
              return (
                <div
                  key={item.questionId}
                  className={`p-4 rounded-xl border text-sm transition-all ${
                    item.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                          item.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {item.questionNumber}
                      </span>
                      <span className="font-semibold text-slate-900">{q?.question}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isCorrect ? 'Benar (+ ' + item.scoreEarned + ' pt)' : 'Salah (0 pt)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-8 mb-2">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 font-semibold block text-[11px]">
                        Jawaban Kamu:
                      </span>
                      <span
                        className={`font-bold ${
                          item.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {item.studentAnswerDisplay || 'Tidak Dijawab'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 font-semibold block text-[11px]">
                        Kunci Jawaban Benar:
                      </span>
                      <span className="font-bold text-slate-800">{item.correctAnswerDisplay}</span>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="pl-8 pt-1 text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Pembahasan: </span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-2">
            Klik tombol &quot;Lihat Pembahasan&quot; di kanan atas untuk mempelajari kunci jawaban dan pembahasannya.
          </p>
        )}
      </div>
    </div>
  );
};
