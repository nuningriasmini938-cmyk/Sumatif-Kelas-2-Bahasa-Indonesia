import React from 'react';
import { Question, StudentAnswerValue } from '../types';
import { Check, CheckSquare, Square, HelpCircle, Edit3, Layers } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  displayNumber: number;
  totalQuestions: number;
  answer: StudentAnswerValue | undefined;
  onAnswerChange: (answer: StudentAnswerValue) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  displayNumber,
  totalQuestions,
  answer,
  onAnswerChange,
}) => {
  // Handlers for each type
  const handleSelectRadio = (key: string) => {
    onAnswerChange(key);
  };

  const handleToggleCheckbox = (key: string) => {
    const currentList: string[] = Array.isArray(answer) ? [...answer] : [];
    if (currentList.includes(key)) {
      onAnswerChange(currentList.filter((k) => k !== key));
    } else {
      onAnswerChange([...currentList, key]);
    }
  };

  const handleCategoryChoice = (statementId: string, choiceValue: string) => {
    const currentMap: Record<string, string> =
      typeof answer === 'object' && !Array.isArray(answer) && answer !== null
        ? { ...(answer as Record<string, string>) }
        : {};
    currentMap[statementId] = choiceValue;
    onAnswerChange(currentMap);
  };

  const handleTextChange = (text: string) => {
    onAnswerChange(text);
  };

  const getTypeBadge = () => {
    switch (question.type) {
      case 'pilihan_ganda':
        return { label: 'Pilihan Ganda', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'pilihan_ganda_kompleks':
        return { label: 'Pilihan Ganda Kompleks', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'kompleks_kategori':
        return { label: 'Pernyataan Kategori', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'isian_singkat':
        return { label: 'Isian Singkat', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'Soal', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const typeInfo = getTypeBadge();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
      {/* Header Info Soal */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-sm shadow-xs">
            {displayNumber}
          </span>
          <span className="text-xs text-slate-400 font-medium">dari {totalQuestions} Soal</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
            Tingkat: {question.difficulty}
          </span>
        </div>
      </div>

      {/* Pertanyaan */}
      <div className="mb-6">
        <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
          {question.question}
        </p>

        {question.type === 'pilihan_ganda_kompleks' && (
          <p className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-purple-200">
            <CheckSquare className="w-3.5 h-3.5" />
            Tips: Boleh mencentang lebih dari 1 pilihan jawaban yang menurutmu benar!
          </p>
        )}
      </div>

      {/* Render Opsi berdasarkan Jenis Soal */}

      {/* 1. Pilihan Ganda (Single Select) */}
      {question.type === 'pilihan_ganda' && (
        <div className="space-y-3">
          {question.options?.map((opt) => {
            const isSelected = answer === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                id={`option-${question.id}-${opt.key}`}
                onClick={() => handleSelectRadio(opt.key)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {opt.key}
                </div>
                <span className="text-sm sm:text-base flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Pilihan Ganda Kompleks (Multi Select) */}
      {question.type === 'pilihan_ganda_kompleks' && (
        <div className="space-y-3">
          {question.options?.map((opt) => {
            const currentSelected = Array.isArray(answer) ? answer : [];
            const isChecked = currentSelected.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                id={`option-multi-${question.id}-${opt.key}`}
                onClick={() => handleToggleCheckbox(opt.key)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                  isChecked
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {isChecked ? <Check className="w-5 h-5 stroke-[2.5]" /> : opt.key}
                </div>
                <span className="text-sm sm:text-base flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Pilihan Ganda Kompleks Kategori (Pernyataan Benar/Salah, Setuju/Tidak dsb) */}
      {question.type === 'kompleks_kategori' && (
        <div className="space-y-4">
          {question.statements?.map((stmt, sIdx) => {
            const currentMap =
              typeof answer === 'object' && !Array.isArray(answer) && answer !== null
                ? (answer as Record<string, string>)
                : {};
            const chosenValue = currentMap[stmt.id] || '';

            // Choices options based on categoryType
            let choices = ['Benar', 'Salah'];
            if (question.categoryType === 'Setuju/Tidak Setuju') {
              choices = ['Setuju', 'Tidak Setuju'];
            } else if (question.categoryType === 'Sesuai/Tidak Sesuai') {
              choices = ['Sesuai', 'Tidak Sesuai'];
            }

            return (
              <div
                key={stmt.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-2.5 mb-3">
                  <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    Pernyataan {sIdx + 1}
                  </span>
                  <p className="text-sm sm:text-base text-slate-800 font-medium leading-snug">
                    {stmt.statement}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-2 sm:pl-8">
                  {choices.map((choice) => {
                    const isSelected = chosenValue === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        id={`btn-stmt-${stmt.id}-${choice.replace(/\s+/g, '')}`}
                        onClick={() => handleCategoryChoice(stmt.id, choice)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? choice === 'Benar' || choice === 'Setuju' || choice === 'Sesuai'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{choice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Isian Singkat */}
      {question.type === 'isian_singkat' && (
        <div className="space-y-2">
          <label htmlFor={`input-isian-${question.id}`} className="block text-xs font-bold text-slate-700">
            Ketik jawabanmu pada kotak di bawah ini:
          </label>
          <div className="relative">
            <input
              id={`input-isian-${question.id}`}
              type="text"
              value={typeof answer === 'string' ? answer : ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Tulis kata jawaban singkatmu di sini..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium placeholder:text-slate-400 bg-white"
            />
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Gunakan huruf kecil atau besar, sistem akan memeriksa secara otomatis.
          </p>
        </div>
      )}
    </div>
  );
};
