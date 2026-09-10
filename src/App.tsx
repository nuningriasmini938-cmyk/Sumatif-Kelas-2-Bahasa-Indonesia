import React, { useState, useEffect } from 'react';
import {
  StudentIdentity,
  StudentAnswerValue,
  StudentSubmission,
  TeacherSettings,
  Question,
} from './types';
import { INITIAL_QUESTIONS } from './data/questions';
import { prepareSessionQuestions } from './utils/shuffle';
import { evaluateExam, ExamEvaluationResult } from './utils/scoring';
import {
  getTeacherSettings,
  saveSubmission,
  getAllSubmissions,
  syncToGoogleSpreadsheet,
} from './utils/spreadsheetSync';
import { Navbar } from './components/Navbar';
import { StudentIdentityStep } from './components/StudentIdentityStep';
import { ExamStep } from './components/ExamStep';
import { ResultStep } from './components/ResultStep';
import { TeacherPanelModal } from './components/TeacherPanelModal';

export default function App() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [studentIdentity, setStudentIdentity] = useState<StudentIdentity | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, StudentAnswerValue>>({});
  const [currentSubmission, setCurrentSubmission] = useState<StudentSubmission | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<ExamEvaluationResult | null>(null);

  // Teacher Panel State & Settings
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(getTeacherSettings());
  const [allSubmissions, setAllSubmissions] = useState<StudentSubmission[]>(getAllSubmissions());
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Reload submissions whenever teacher modal opens or changes
  const refreshSubmissions = () => {
    setAllSubmissions(getAllSubmissions());
  };

  // Tahap 1 -> Tahap 2: Start Exam
  const handleStartExam = (identity: StudentIdentity) => {
    setStudentIdentity(identity);
    // Shuffle questions and options per user specification
    const randomizedQuestions = prepareSessionQuestions(INITIAL_QUESTIONS);
    setSessionQuestions(randomizedQuestions);
    setAnswers({});
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle single question answer change
  const handleAnswerChange = (questionId: number, answerValue: StudentAnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerValue,
    }));
  };

  // Tahap 2 -> Tahap 3: Submit Exam
  const handleSubmitExam = async () => {
    if (!studentIdentity) return;

    // Evaluate exam
    const evaluation = evaluateExam(
      sessionQuestions,
      answers,
      teacherSettings.passingScore || 70
    );
    setEvaluationResult(evaluation);

    const now = new Date();
    const timestampFormatted = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const submissionData: StudentSubmission = {
      id: `sub_${Date.now()}_${studentIdentity.absentNumber}`,
      timestamp: timestampFormatted,
      studentName: studentIdentity.fullName,
      absentNumber: studentIdentity.absentNumber,
      grade: studentIdentity.grade,
      school: studentIdentity.school,
      subject: studentIdentity.subject,
      theme: studentIdentity.theme,
      totalQuestions: sessionQuestions.length,
      correctCount: evaluation.correctCount,
      incorrectCount: evaluation.incorrectCount,
      finalScore: evaluation.finalScore,
      status: evaluation.status,
      answers,
      syncedToSpreadsheet: false,
    };

    setCurrentSubmission(submissionData);

    // Save locally for Teacher Panel
    saveSubmission(submissionData);
    refreshSubmissions();

    // Background Autonomous Sync to Google Spreadsheet if webhook is configured
    if (teacherSettings.googleSheetsWebhookUrl) {
      syncToGoogleSpreadsheet(submissionData, teacherSettings.googleSheetsWebhookUrl).then(() => {
        refreshSubmissions();
      });
    }

    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake exam
  const handleRetakeExam = () => {
    setActiveStep(1);
    setAnswers({});
    setCurrentSubmission(null);
    setEvaluationResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-200">
      {/* Primary Navigation Bar */}
      <Navbar
        onOpenTeacherPanel={() => {
          refreshSubmissions();
          setIsTeacherModalOpen(true);
        }}
        activeStep={activeStep}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeStep === 1 && (
          <StudentIdentityStep
            onStartExam={handleStartExam}
            initialIdentity={studentIdentity || undefined}
          />
        )}

        {activeStep === 2 && studentIdentity && sessionQuestions.length > 0 && (
          <ExamStep
            studentIdentity={studentIdentity}
            questions={sessionQuestions}
            rawQuestionsForPdf={INITIAL_QUESTIONS}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {activeStep === 3 && currentSubmission && evaluationResult && (
          <ResultStep
            submission={currentSubmission}
            evaluation={evaluationResult}
            questions={sessionQuestions}
            teacherSettings={teacherSettings}
            onRetakeExam={handleRetakeExam}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Tes Sumatif Bahasa Indonesia Kelas II • Menjaga Kesehatan
          </p>
          <p>
            SD NEGERI 3 LOLOAN TIMUR • Sistem Evaluasi Pembelajaran Digital Berbasis Web
          </p>
          <p className="text-[11px] text-slate-400">
            KKTP: 70 • 35 Butir Soal Terstandar Kurikulum Merdeka
          </p>
        </div>
      </footer>

      {/* Teacher Panel Modal (Password: GURUADMIN) */}
      <TeacherPanelModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        submissions={allSubmissions}
        onSubmissionsChange={refreshSubmissions}
        teacherSettings={teacherSettings}
        onSettingsChange={(newSettings) => setTeacherSettings(newSettings)}
        questions={INITIAL_QUESTIONS}
      />
    </div>
  );
}
