import { Question, StudentAnswerValue } from '../types';

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Prepares questions for a student session by:
 * 1. Shuffling question order
 * 2. Shuffling options for multiple choice questions
 * 3. Preserving original IDs and data for accurate scoring
 */
export function prepareSessionQuestions(questions: Question[]): Question[] {
  const shuffledQuestions = shuffleArray(questions);

  return shuffledQuestions.map((q) => {
    if ((q.type === 'pilihan_ganda' || q.type === 'pilihan_ganda_kompleks') && q.options) {
      const shuffledOptions = shuffleArray(q.options);
      // Re-assign keys A, B, C... so the UI is clean and consistent
      const keyMap: Record<string, string> = {};
      const newOptions = shuffledOptions.map((opt, idx) => {
        const newKey = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'
        keyMap[opt.key] = newKey;
        return {
          originalKey: opt.key,
          key: newKey,
          text: opt.text,
        };
      });

      let newCorrectAnswer = q.correctAnswer;
      if (q.correctAnswer && keyMap[q.correctAnswer]) {
        newCorrectAnswer = keyMap[q.correctAnswer];
      }

      let newCorrectAnswers = q.correctAnswers;
      if (q.correctAnswers) {
        newCorrectAnswers = q.correctAnswers.map((k) => keyMap[k] || k);
      }

      return {
        ...q,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
        correctAnswers: newCorrectAnswers,
      };
    }

    return { ...q };
  });
}
