import { Question, StudentAnswerValue } from '../types';

export interface EvaluationItemResult {
  questionId: number;
  questionNumber: number;
  isCorrect: boolean;
  scoreEarned: number;
  maxScore: number;
  studentAnswerDisplay: string;
  correctAnswerDisplay: string;
  explanation: string;
}

export interface ExamEvaluationResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  finalScore: number; // 0 - 100
  status: 'Lulus' | 'Belum Lulus';
  itemResults: EvaluationItemResult[];
}

/**
 * Normalizes string for tolerant comparison (lowercase, trimmed, collapsed spaces)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
}

/**
 * Evaluates an individual question based on question type
 */
export function evaluateSingleQuestion(
  question: Question,
  questionNumber: number,
  studentAnswer: StudentAnswerValue | undefined
): EvaluationItemResult {
  let isCorrect = false;
  let scoreEarned = 0;
  let maxScore = 0;
  let studentAnswerDisplay = 'Belum Dijawab';
  let correctAnswerDisplay = '';

  // Determine maxScore by type for standard 100-point total:
  // 20 PG x 2 pt = 40
  // 5 PG Kompleks x 4 pt = 20
  // 5 Kategori x 4 pt = 20
  // 5 Isian Singkat x 4 pt = 20
  // Total = 100 pts
  if (question.type === 'pilihan_ganda') {
    maxScore = 2;
    correctAnswerDisplay = `${question.correctAnswer}. ${
      question.options?.find((o) => o.key === question.correctAnswer)?.text || ''
    }`;

    if (typeof studentAnswer === 'string' && studentAnswer) {
      const chosenOpt = question.options?.find((o) => o.key === studentAnswer);
      studentAnswerDisplay = `${studentAnswer}. ${chosenOpt?.text || ''}`;
      if (studentAnswer.toUpperCase() === (question.correctAnswer || '').toUpperCase()) {
        isCorrect = true;
        scoreEarned = maxScore;
      }
    }
  } else if (question.type === 'pilihan_ganda_kompleks') {
    maxScore = 4;
    const correctKeys = (question.correctAnswers || []).sort();
    correctAnswerDisplay = correctKeys
      .map((k) => `${k}. ${question.options?.find((o) => o.key === k)?.text || ''}`)
      .join(' ; ');

    if (Array.isArray(studentAnswer) && studentAnswer.length > 0) {
      const chosenKeys = [...studentAnswer].sort();
      studentAnswerDisplay = chosenKeys
        .map((k) => `${k}. ${question.options?.find((o) => o.key === k)?.text || ''}`)
        .join(' ; ');

      // Check if chosenKeys match correctKeys exactly
      if (
        chosenKeys.length === correctKeys.length &&
        chosenKeys.every((val, index) => val === correctKeys[index])
      ) {
        isCorrect = true;
        scoreEarned = maxScore;
      } else {
        // Partial credit: correctly selected minus incorrect selected
        const correctChosen = chosenKeys.filter((k) => correctKeys.includes(k)).length;
        const wrongChosen = chosenKeys.filter((k) => !correctKeys.includes(k)).length;
        if (correctChosen > 0 && wrongChosen === 0) {
          // Half score if 1 of 2 correct and 0 wrong
          scoreEarned = Math.round((correctChosen / correctKeys.length) * maxScore);
        }
      }
    }
  } else if (question.type === 'kompleks_kategori') {
    maxScore = 4;
    const statements = question.statements || [];
    correctAnswerDisplay = statements
      .map((s, idx) => `Pernyataan ${idx + 1}: ${s.correctValue}`)
      .join(' | ');

    if (studentAnswer && typeof studentAnswer === 'object' && !Array.isArray(studentAnswer)) {
      const ansMap = studentAnswer as Record<string, string>;
      const displayParts: string[] = [];
      let allCorrect = true;
      let correctSubCount = 0;

      statements.forEach((s, idx) => {
        const val = ansMap[s.id] || 'Belum diisi';
        displayParts.push(`P${idx + 1}: ${val}`);
        if (val.trim().toLowerCase() === s.correctValue.trim().toLowerCase()) {
          correctSubCount++;
        } else {
          allCorrect = false;
        }
      });

      studentAnswerDisplay = displayParts.join(' | ');
      if (allCorrect) {
        isCorrect = true;
        scoreEarned = maxScore;
      } else if (correctSubCount > 0) {
        // Proportional partial score
        scoreEarned = Math.round((correctSubCount / statements.length) * maxScore);
      }
    }
  } else if (question.type === 'isian_singkat') {
    maxScore = 4;
    const accepted = question.acceptedAnswers || [];
    correctAnswerDisplay = accepted.join(' / ');

    if (typeof studentAnswer === 'string' && studentAnswer.trim()) {
      studentAnswerDisplay = studentAnswer.trim();
      const normInput = normalizeText(studentAnswer);
      const isMatch = accepted.some((acc) => normalizeText(acc) === normInput);

      if (isMatch) {
        isCorrect = true;
        scoreEarned = maxScore;
      }
    }
  }

  return {
    questionId: question.id,
    questionNumber,
    isCorrect,
    scoreEarned,
    maxScore,
    studentAnswerDisplay,
    correctAnswerDisplay,
    explanation: question.explanation,
  };
}

/**
 * Checks if a question has been answered by the student
 */
export function isQuestionAnswered(
  question: Question,
  answer: StudentAnswerValue | undefined
): boolean {
  if (answer === undefined || answer === null) return false;

  if (question.type === 'pilihan_ganda') {
    return typeof answer === 'string' && answer.trim().length > 0;
  }

  if (question.type === 'pilihan_ganda_kompleks') {
    return Array.isArray(answer) && answer.length > 0;
  }

  if (question.type === 'kompleks_kategori') {
    if (typeof answer !== 'object' || Array.isArray(answer)) return false;
    const ansMap = answer as Record<string, string>;
    const statements = question.statements || [];
    return statements.every((s) => !!ansMap[s.id] && ansMap[s.id].trim().length > 0);
  }

  if (question.type === 'isian_singkat') {
    return typeof answer === 'string' && answer.trim().length > 0;
  }

  return false;
}

/**
 * Grades the complete exam session
 */
export function evaluateExam(
  questions: Question[],
  answers: Record<number, StudentAnswerValue>,
  passingScore = 70
): ExamEvaluationResult {
  const itemResults: EvaluationItemResult[] = [];
  let totalScoreEarned = 0;
  let totalMaxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q, idx) => {
    const studentAns = answers[q.id];
    const itemEval = evaluateSingleQuestion(q, idx + 1, studentAns);
    itemResults.push(itemEval);

    totalScoreEarned += itemEval.scoreEarned;
    totalMaxScore += itemEval.maxScore;

    if (itemEval.isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  // Scale to 0 - 100
  const finalScore = totalMaxScore > 0 ? Math.round((totalScoreEarned / totalMaxScore) * 100) : 0;
  const status: 'Lulus' | 'Belum Lulus' = finalScore >= passingScore ? 'Lulus' : 'Belum Lulus';

  return {
    totalQuestions: questions.length,
    correctCount,
    incorrectCount,
    finalScore,
    status,
    itemResults,
  };
}
