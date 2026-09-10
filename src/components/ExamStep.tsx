import React, { useState } from 'react';
import { Question, StudentAnswerValue, StudentIdentity } from '../types';
import { QuestionCard } from './QuestionCard';
import { isQuestionAnswered } from '../utils/scoring';
import { generateQuestionsPDF } from '../utils/pdfGenerator';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  ListOrdered,
  FileText,
} from 'lucide-react';

interface ExamStepProps {
  studentIdentity: StudentIdentity;
  questions: Question[];
  rawQuestionsForPdf: Question[];
  answers: Record<number, StudentAnswerValue>;
  onAnswerChange: (questionId: number, answer: StudentAnswerValue) => void;
  onSubmitExam: () => void;
}

export const ExamStep: React.FC<ExamStepProps> = ({
  studentIdentity,
  questions,
  rawQuestionsForPdf,
  answers,
  onAnswerChange,
  onSubmitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [showMobileGrid, setShowMobileGrid] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Count answered questions
  const answeredIndices: number[] = [];
  const unansweredIndices: number[] = [];

  questions.forEach((q, idx) => {
    if (isQuestionAnswered(q, answers[q.id])) {
      answeredIndices.push(idx);
    } else {
      unansweredIndices.push(idx);
    }
  });

  const answeredCount = answeredIndices.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowMobileGrid(false);
    setShowUnansweredModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAttemptSubmit = () => {
    if (answeredCount < totalQuestions) {
      setShowUnansweredModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmitExam();
  };

  const handleDownloadPdf = () => {
    generateQuestionsPDF(rawQuestionsForPdf.length > 0 ? rawQuestionsForPdf : questions);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-5 px-4 sm:px-6">
      {/* Top Banner: Student info & Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {studentIdentity.absentNumber}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Peserta Ujian • Kelas {studentIdentity.grade}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {studentIdentity.fullName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF Naskah Soal button */}
          <button
            id="btn-download-questions-pdf"
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Unduh Naskah Soal PDF"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Unduh Soal PDF</span>
          </button>

          {/* Toggle Grid on mobile */}
          <button
            id="btn-toggle-grid-mobile"
            type="button"
            onClick={() => setShowMobileGrid(!showMobileGrid)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Nomor ({answeredCount}/{totalQuestions})</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-xs">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="text-slate-700">
            Progres Pengerjaan: <span className="text-blue-600 font-bold">{answeredCount}</span> dari{' '}
            <span className="font-bold">{totalQuestions}</span> soal selesai
          </span>
          <span className="text-blue-600 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content Layout: Question on Left/Center, Nav grid on Right (Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Question & Navigation Controls */}
        <div className="md:col-span-8 lg:col-span-9 space-y-5">
          <QuestionCard
            question={currentQuestion}
            displayNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(val) => onAnswerChange(currentQuestion.id, val)}
          />

          {/* Navigation buttons: Prev, Next, Submit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
            <button
              id="btn-prev-question"
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                currentIndex === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                id="btn-next-question"
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-xs transition-all"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-submit-exam-last"
                type="button"
                onClick={handleAttemptSubmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-md transition-all animate-pulse"
              >
                <Send className="w-4 h-4" />
                <span>Selesai / Kirim Jawaban</span>
              </button>
            )}
          </div>

          {/* Direct Submit Button visible anytime on bottom */}
          <div className="text-center pt-2">
            <button
              id="btn-submit-exam-always"
              type="button"
              onClick={handleAttemptSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Kirim Seluruh Jawaban ({answeredCount}/{totalQuestions} Terjawab)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Question Number Grid (Desktop & Tablet) */}
        <div
          className={`md:col-span-4 lg:col-span-3 ${
            showMobileGrid
              ? 'fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center'
              : 'hidden md:block'
          }`}
        >
          <div
            className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm w-full ${
              showMobileGrid ? 'max-w-md max-h-[85vh] overflow-y-auto' : 'sticky top-20'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                Daftar Nomor Soal
              </h4>
              {showMobileGrid && (
                <button
                  type="button"
                  onClick={() => setShowMobileGrid(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 mb-3 pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Aktif
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Terjawab
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Belum
              </span>
            </div>

            {/* Grid of 35 numbers */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = isQuestionAnswered(q, answers[q.id]);

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isActive) {
                  btnClass = 'bg-blue-600 text-white font-bold border-blue-600 ring-2 ring-blue-300';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-100 text-emerald-900 font-semibold border-emerald-300';
                }

                return (
                  <button
                    key={q.id}
                    id={`btn-nav-question-${idx + 1}`}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Info summary */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Selesai: {answeredCount}</span>
              <span className="text-amber-600 font-semibold">
                Sisa: {totalQuestions - answeredCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: UNANSWERED QUESTIONS WARNING (Strict Requirement: Tidak dapat mengirim sebelum seluruh soal dijawab) */}
      {showUnansweredModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Ada Soal yang Belum Dijawab!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
              Sesuai aturan ujian sekolah, kamu <span className="font-bold text-slate-900">wajib menjawab seluruh 35 soal</span> sebelum dapat mengirimkan jawaban.
            </p>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 mb-4">
              <p className="text-xs font-bold text-amber-900 mb-2">
                Nomor soal yang belum dijawab ({unansweredIndices.length} soal):
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {unansweredIndices.map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100"
                  >
                    No. {idx + 1}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-amber-700 mt-2 italic">
                * Ketuk nomor di atas untuk langsung menuju soal tersebut.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUnansweredModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
              >
                Tutup & Lanjutkan Menjawab
              </button>
              {unansweredIndices.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleJumpToQuestion(unansweredIndices[0])}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors"
                >
                  Buka No. {unansweredIndices[0] + 1}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMATION BEFORE SUBMIT */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Konfirmasi Pengiriman Jawaban
            </h3>
            <p className="text-sm text-slate-600 text-center mb-5 leading-relaxed">
              Apakah Anda yakin ingin mengirim jawaban? Seluruh <span className="font-bold text-slate-900">35 soal</span> telah dijawab dengan lengkap. Jawaban yang sudah dikirim tidak dapat diubah kembali.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-5 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Nama Siswa:</span>
                <span className="font-bold text-slate-900">{studentIdentity.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Nomor Absen:</span>
                <span className="font-bold text-slate-900">{studentIdentity.absentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Jawaban:</span>
                <span className="font-bold text-emerald-600">Lengkap (35/35 Terjawab)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                id="btn-cancel-submit"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
              >
                Periksa Lagi
              </button>
              <button
                id="btn-confirm-submit"
                type="button"
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Ya, Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
