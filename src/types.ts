export type QuestionType =
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'kompleks_kategori'
  | 'isian_singkat';

export type CategoryResponseChoice = 'Benar/Salah' | 'Setuju/Tidak Setuju' | 'Sesuai/Tidak Sesuai';

export interface CategoryStatement {
  id: string;
  statement: string;
  correctValue: string; // e.g. 'Benar', 'Salah', 'Setuju', 'Tidak Setuju', 'Sesuai', 'Tidak Sesuai'
}

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  image?: string;
  options?: { key: string; text: string }[]; // For pilihan_ganda & pilihan_ganda_kompleks
  correctAnswer?: string; // For pilihan_ganda (e.g. 'A')
  correctAnswers?: string[]; // For pilihan_ganda_kompleks (e.g. ['A', 'C'])
  categoryType?: CategoryResponseChoice; // For kompleks_kategori
  statements?: CategoryStatement[]; // For kompleks_kategori
  acceptedAnswers?: string[]; // For isian_singkat (lowercase trimmed matching)
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  explanation: string; // Pembahasan
}

export interface StudentIdentity {
  fullName: string;
  absentNumber: string;
  grade: string;
  school: string;
  subject: string;
  theme: string;
}

// Student answers structure
// For pilihan_ganda: string
// For pilihan_ganda_kompleks: string[]
// For kompleks_kategori: Record<statementId, chosenValue>
// For isian_singkat: string
export type StudentAnswerValue = string | string[] | Record<string, string>;

export interface StudentSubmission {
  id: string;
  timestamp: string;
  studentName: string;
  absentNumber: string;
  grade: string;
  school: string;
  subject: string;
  theme: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  finalScore: number;
  status: 'Lulus' | 'Belum Lulus';
  answers: Record<number, StudentAnswerValue>;
  syncedToSpreadsheet: boolean;
}

export interface TeacherSettings {
  showAnswerKeyToStudent: boolean;
  googleSheetsWebhookUrl: string;
  schoolName: string;
  grade: string;
  subject: string;
  passingScore: number; // KKTP default 70
}
