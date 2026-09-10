import { StudentSubmission, TeacherSettings } from '../types';

const STORAGE_SUBMISSIONS_KEY = 'sdn3_sumatif_submissions_v1';
const STORAGE_SETTINGS_KEY = 'sdn3_sumatif_settings_v1';

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  showAnswerKeyToStudent: false, // strictly hidden by default per user prompt
  googleSheetsWebhookUrl: '',
  schoolName: 'SD NEGERI 3 LOLOAN TIMUR',
  grade: 'II',
  subject: 'Bahasa Indonesia',
  passingScore: 70, // KKTP 70
};

export const TEACHER_PASSWORD = 'GURUADMIN'; // strictly per user prompt

/**
 * Retrieves teacher settings from localStorage
 */
export function getTeacherSettings(): TeacherSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_TEACHER_SETTINGS;
    return { ...DEFAULT_TEACHER_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to parse teacher settings', err);
    return DEFAULT_TEACHER_SETTINGS;
  }
}

/**
 * Saves teacher settings to localStorage
 */
export function saveTeacherSettings(settings: TeacherSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save teacher settings', err);
  }
}

/**
 * Retrieves all stored submissions
 */
export function getAllSubmissions(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse submissions', err);
    return [];
  }
}

/**
 * Saves a new student submission locally
 */
export function saveSubmission(submission: StudentSubmission): void {
  try {
    const existing = getAllSubmissions();
    const updated = [submission, ...existing.filter((s) => s.id !== submission.id)];
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save submission', err);
  }
}

/**
 * Deletes a single submission (for teacher management)
 */
export function deleteSubmission(id: string): void {
  try {
    const existing = getAllSubmissions();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete submission', err);
  }
}

/**
 * Clears all submissions
 */
export function clearAllSubmissions(): void {
  try {
    localStorage.removeItem(STORAGE_SUBMISSIONS_KEY);
  } catch (err) {
    console.error('Failed to clear submissions', err);
  }
}

/**
 * Sends test result to Google Sheets Webhook (via Google Apps Script Web App)
 */
export async function syncToGoogleSpreadsheet(
  submission: StudentSubmission,
  webhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  const settings = getTeacherSettings();
  const targetUrl = webhookUrl || settings.googleSheetsWebhookUrl;

  if (!targetUrl || !targetUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Spreadsheet Webhook belum diatur oleh Guru.',
    };
  }

  const payload = {
    timestamp: submission.timestamp,
    nama_siswa: submission.studentName,
    kelas: submission.grade,
    nomor_absen: submission.absentNumber,
    jumlah_benar: submission.correctCount,
    jumlah_salah: submission.incorrectCount,
    nilai: submission.finalScore,
    status: submission.status,
    sekolah: submission.school,
    mata_pelajaran: submission.subject,
    materi: submission.theme,
  };

  try {
    // Note: Google Apps Script Web App standard method uses 'no-cors' or normal POST
    // We send standard JSON with text/plain to prevent CORS preflight blocking in Apps Script
    await fetch(targetUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    // Mark submission as synced
    const all = getAllSubmissions();
    const target = all.find((s) => s.id === submission.id);
    if (target) {
      target.syncedToSpreadsheet = true;
      localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(all));
    }

    return {
      success: true,
      message: 'Data berhasil disinkronkan ke Google Spreadsheet!',
    };
  } catch (err) {
    console.error('Error syncing to Google Spreadsheet', err);
    return {
      success: false,
      message: 'Gagal mengirim ke Google Spreadsheet. Periksa koneksi atau URL Webhook.',
    };
  }
}

/**
 * Generates ready-to-use Google Apps Script code for the teacher
 */
export function getGoogleAppsScriptTemplate(): string {
  return `// =================================================================
// GOOGLE APPS SCRIPT - AUTO REKAP NILAI SD NEGERI 3 LOLOAN TIMUR
// =================================================================
// 1. Buat Google Sheet baru dengan nama "Rekap Nilai Siswa SDN 3 Loloan Timur"
// 2. Klik menu "Ekstensi" (Extensions) > "Apps Script"
// 3. Hapus kode yang ada, lalu tempel (paste) seluruh kode di bawah ini
// 4. Klik "Deploy" (Terapkan) > "New deployment" (Penerapan baru)
// 5. Pilih tipe: "Web app" (Aplikasi Web)
// 6. Atur "Execute as": Me (Email Anda)
// 7. Atur "Who has access": Anyone (Siapa saja)
// 8. Klik Deploy & Berikan izin (Authorize), lalu salin Web App URL ke Panel Guru
// =================================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Buat Header otomatis jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Nama Siswa",
        "Kelas",
        "Nomor Absen",
        "Jumlah Benar",
        "Jumlah Salah",
        "Nilai Akhir",
        "Status Kelulusan",
        "Sekolah",
        "Mata Pelajaran",
        "Materi"
      ]);
      // Format header tebal & background rapi
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("id-ID"),
      data.nama_siswa,
      data.kelas,
      data.nomor_absen,
      data.jumlah_benar,
      data.jumlah_salah,
      data.nilai,
      data.status,
      data.sekolah,
      data.mata_pelajaran,
      data.materi
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Data tersimpan" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}

/**
 * Exports submissions to CSV format
 */
export function exportSubmissionsToCSV(submissions: StudentSubmission[]): void {
  if (submissions.length === 0) return;

  const headers = [
    'No',
    'Tanggal & Waktu',
    'Nama Siswa',
    'Kelas',
    'Nomor Absen',
    'Jumlah Benar',
    'Jumlah Salah',
    'Nilai Akhir (0-100)',
    'Status Kelulusan (KKTP 70)',
    'Sekolah',
    'Mata Pelajaran',
    'Materi',
  ];

  const rows = submissions.map((s, idx) => [
    idx + 1,
    `"${s.timestamp}"`,
    `"${s.studentName}"`,
    `"${s.grade}"`,
    `"${s.absentNumber}"`,
    s.correctCount,
    s.incorrectCount,
    s.finalScore,
    `"${s.status}"`,
    `"${s.school}"`,
    `"${s.subject}"`,
    `"${s.theme}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Rekap_Nilai_Bahasa_Indonesia_Kelas2_SDN3_Loloan_Timur_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
