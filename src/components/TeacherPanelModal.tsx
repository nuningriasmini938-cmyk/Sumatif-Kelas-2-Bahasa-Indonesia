import React, { useState } from 'react';
import {
  StudentSubmission,
  TeacherSettings,
  Question,
} from '../types';
import {
  TEACHER_PASSWORD,
  saveTeacherSettings,
  exportSubmissionsToCSV,
  deleteSubmission,
  clearAllSubmissions,
  syncToGoogleSpreadsheet,
  getGoogleAppsScriptTemplate,
} from '../utils/spreadsheetSync';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Copy,
  BookOpen,
  Settings,
  HelpCircle,
  Users,
  Award,
} from 'lucide-react';

interface TeacherPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: StudentSubmission[];
  onSubmissionsChange: () => void;
  teacherSettings: TeacherSettings;
  onSettingsChange: (newSettings: TeacherSettings) => void;
  questions: Question[];
}

export const TeacherPanelModal: React.FC<TeacherPanelModalProps> = ({
  isOpen,
  onClose,
  submissions,
  onSubmissionsChange,
  teacherSettings,
  onSettingsChange,
  questions,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'rekap' | 'spreadsheet' | 'pengaturan' | 'soal'>('rekap');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Lulus' | 'Belum Lulus'>('all');
  const [webhookUrlInput, setWebhookUrlInput] = useState(teacherSettings.googleSheetsWebhookUrl);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ id: string; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === TEACHER_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Password salah! Silakan coba lagi.');
    }
  };

  const handleSaveSettings = (newSettings: Partial<TeacherSettings>) => {
    const updated = { ...teacherSettings, ...newSettings };
    onSettingsChange(updated);
    saveTeacherSettings(updated);
  };

  const handleSaveWebhook = () => {
    handleSaveSettings({ googleSheetsWebhookUrl: webhookUrlInput.trim() });
    alert('URL Google Spreadsheet Webhook berhasil disimpan!');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(getGoogleAppsScriptTemplate());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSyncItem = async (sub: StudentSubmission) => {
    setSyncStatusMsg({ id: sub.id, text: 'Sedang mengirim...' });
    const res = await syncToGoogleSpreadsheet(sub, teacherSettings.googleSheetsWebhookUrl);
    setSyncStatusMsg({ id: sub.id, text: res.message });
    onSubmissionsChange();
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Hapus rekaman nilai siswa "${name}"?`)) {
      deleteSubmission(id);
      onSubmissionsChange();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('YAKIN ingin menghapus SELURUH data rekap nilai siswa? Tindakan ini tidak bisa dibatalkan.')) {
      clearAllSubmissions();
      onSubmissionsChange();
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.absentNumber.includes(searchQuery);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate statistics
  const totalCount = submissions.length;
  const passedCount = submissions.filter((s) => s.status === 'Lulus').length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const avgScore =
    totalCount > 0
      ? Math.round(submissions.reduce((acc, curr) => acc + curr.finalScore, 0) / totalCount)
      : 0;
  const maxScore = totalCount > 0 ? Math.max(...submissions.map((s) => s.finalScore)) : 0;
  const minScore = totalCount > 0 ? Math.min(...submissions.map((s) => s.finalScore)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Panel Guru & Rekapitulasi</h3>
              <p className="text-xs text-slate-400">
                SD Negeri 3 Loloan Timur • Bahasa Indonesia Kelas II
              </p>
            </div>
          </div>

          <button
            id="btn-close-teacher-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Login Gate or Admin Panel */}
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
              <KeyRound className="w-7 h-7" />
            </div>

            <h4 className="text-xl font-black text-slate-900 mb-1">Akses Khusus Guru</h4>
            <p className="text-xs text-slate-500 mb-6">
              Masukkan password admin untuk melihat data nilai siswa dan pengaturan ujian.
            </p>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Guru
                </label>
                <input
                  id="input-teacher-password"
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <button
                id="btn-submit-teacher-login"
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Masuk ke Panel Guru</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Panel */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Nav Tabs */}
            <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                id="tab-rekap"
                onClick={() => setActiveTab('rekap')}
                className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'rekap'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Rekap Nilai Siswa ({submissions.length})</span>
              </button>

              <button
                type="button"
                id="tab-spreadsheet"
                onClick={() => setActiveTab('spreadsheet')}
                className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'spreadsheet'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Auto-Spreadsheet</span>
              </button>

              <button
                type="button"
                id="tab-pengaturan"
                onClick={() => setActiveTab('pengaturan')}
                className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pengaturan'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Kunci Jawaban</span>
              </button>

              <button
                type="button"
                id="tab-soal"
                onClick={() => setActiveTab('soal')}
                className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'soal'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Bank Soal (35 Soal)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* TAB 1: REKAPITULASI NILAI */}
              {activeTab === 'rekap' && (
                <div className="space-y-5">
                  {/* Statistik Ringkas */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-blue-700 block">Total Siswa</span>
                      <span className="text-2xl font-black text-blue-950">{totalCount}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-emerald-700 block">Tingkat Lulus</span>
                      <span className="text-2xl font-black text-emerald-950">{passRate}%</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-slate-600 block">Rata-rata Nilai</span>
                      <span className="text-2xl font-black text-slate-900">{avgScore}</span>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-purple-700 block">Tertinggi</span>
                      <span className="text-2xl font-black text-purple-950">{maxScore}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-amber-700 block">Terendah</span>
                      <span className="text-2xl font-black text-amber-950">{minScore}</span>
                    </div>
                  </div>

                  {/* Filter bar & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <div className="relative min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari nama atau absen siswa..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="py-1.5 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="all">Semua Status</option>
                        <option value="Lulus">Lulus (Tuntas KKTP)</option>
                        <option value="Belum Lulus">Belum Lulus</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-export-csv"
                        onClick={() => exportSubmissionsToCSV(submissions)}
                        disabled={submissions.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Ekspor Excel / CSV</span>
                      </button>

                      {submissions.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                          title="Hapus Semua Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table Rekapitulasi */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3">No</th>
                            <th className="py-3 px-3">Waktu</th>
                            <th className="py-3 px-3">Nama Siswa</th>
                            <th className="py-3 px-3">Absen</th>
                            <th className="py-3 px-3 text-center">Benar</th>
                            <th className="py-3 px-3 text-center">Salah</th>
                            <th className="py-3 px-3 text-center">Nilai</th>
                            <th className="py-3 px-3">Status (KKTP 70)</th>
                            <th className="py-3 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-8 text-center text-slate-400">
                                {submissions.length === 0
                                  ? 'Belum ada siswa yang menyelesaikan ujian.'
                                  : 'Tidak ditemukan data siswa yang cocok dengan pencarian.'}
                              </td>
                            </tr>
                          ) : (
                            filteredSubmissions.map((sub, idx) => (
                              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                                  {sub.timestamp}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {sub.studentName}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-700">
                                  No. {sub.absentNumber}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                                  {sub.correctCount}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-rose-600">
                                  {sub.incorrectCount}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`inline-block font-black text-sm px-2 py-0.5 rounded-md ${
                                      sub.status === 'Lulus'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {sub.finalScore}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                                      sub.status === 'Lulus'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {sub.status === 'Lulus' ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <XCircle className="w-3 h-3" />
                                    )}
                                    <span>{sub.status}</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSyncItem(sub)}
                                      className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                                      title="Kirim ke Spreadsheet"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(sub.id, sub.studentName)}
                                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50"
                                      title="Hapus baris ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {syncStatusMsg && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                      {syncStatusMsg.text}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AUTONOMOUS SPREADSHEET SYNC */}
              {activeTab === 'spreadsheet' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2 mb-1">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      Otomatisasi Kirim Rekap ke Google Spreadsheet
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Setiap kali siswa menyelesaikan tes, sistem akan secara otomatis mengirimkan
                      data: <strong>Timestamp, Nama Siswa, Kelas, Absen, Jumlah Benar, Jumlah Salah, Nilai, dan Status Kelulusan</strong> langsung ke Google Spreadsheet guru.
                    </p>
                  </div>

                  {/* Webhook Configuration Box */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      URL Webhook Google Apps Script (Web App URL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="input-webhook-url"
                        type="url"
                        value={webhookUrlInput}
                        onChange={(e) => setWebhookUrlInput(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        id="btn-save-webhook"
                        onClick={handleSaveWebhook}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0"
                      >
                        Simpan URL
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      * Jika URL diisi, setiap kali siswa klik &quot;Selesai&quot;, nilai mereka otomatis tercatat ke baris Google Sheet.
                    </p>
                  </div>

                  {/* Panduan Pembuatan Script Google Sheet */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CodeIcon className="w-4 h-4 text-blue-600" />
                        Kode Google Apps Script (Siap Pakai untuk Guru)
                      </h5>
                      <button
                        type="button"
                        onClick={handleCopyScript}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedScript ? 'Tersalin!' : 'Salin Seluruh Kode'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">
                      <strong>Cara Pasang (Hanya 1 Menit):</strong>
                      <br />
                      1. Buka <em>Google Sheets</em> kosong Anda.
                      <br />
                      2. Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                      <br />
                      3. Tempelkan (Paste) kode di bawah ini, lalu klik <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru (New Deployment)</strong>.
                      <br />
                      4. Pilih jenis <strong>Aplikasi Web (Web App)</strong>, akses: <strong>Siapa Saja (Anyone)</strong>, lalu salin URL yang didapat ke kotak di atas!
                    </p>

                    <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48">
                      {getGoogleAppsScriptTemplate()}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: PENGATURAN KUNCI JAWABAN & KKTP */}
              {activeTab === 'pengaturan' && (
                <div className="space-y-5 max-w-2xl">
                  {/* Strict Requirement: "Jangan tampilkan kunci jawaban kepada siswa kecuali saya mengaktifkan fitur tersebut." */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            Tampilkan Kunci Jawaban & Pembahasan ke Siswa
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              teacherSettings.showAnswerKeyToStudent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {teacherSettings.showAnswerKeyToStudent ? 'Aktif' : 'Terkunci'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Secara default, kunci jawaban disembunyikan agar siswa tidak saling berbagi kunci jawaban saat ujian berlangsung. Aktifkan fitur ini hanya saat Anda ingin siswa melakukan pembahasan mandiri.
                        </p>
                      </div>

                      <button
                        type="button"
                        id="btn-toggle-answer-key"
                        onClick={() =>
                          handleSaveSettings({
                            showAnswerKeyToStudent: !teacherSettings.showAnswerKeyToStudent,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          teacherSettings.showAnswerKeyToStudent ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            teacherSettings.showAnswerKeyToStudent ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Pengaturan Nilai KKTP */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Nilai batas kelulusan untuk siswa kelas II mata pelajaran Bahasa Indonesia.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={teacherSettings.passingScore}
                        onChange={(e) =>
                          handleSaveSettings({ passingScore: Number(e.target.value) || 70 })
                        }
                        className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 text-center"
                      />
                      <span className="text-xs text-slate-600 font-semibold">
                        Poin (Standar: 70)
                      </span>
                    </div>
                  </div>

                  {/* Informasi Sekolah */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">
                      Identitas Naskah & Satuan Pendidikan
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Nama Sekolah:</span>
                        <span className="font-bold">{teacherSettings.schoolName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Kelas:</span>
                        <span className="font-bold">Kelas {teacherSettings.grade}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Mata Pelajaran:</span>
                        <span className="font-bold">{teacherSettings.subject}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Materi Pokok:</span>
                        <span className="font-bold">Menjaga Kesehatan</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANK SOAL & KUNCI (ADMIN PREVIEW) */}
              {activeTab === 'soal' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Bank Soal Terpasang (Total: {questions.length} Soal)
                      </h4>
                      <p className="text-xs text-slate-500">
                        20 PG • 5 PG Kompleks • 5 Kategori Benar/Salah • 5 Isian Singkat
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border text-[11px] font-semibold text-slate-700">
                              {q.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Tingkat: {q.difficulty}
                          </span>
                        </div>

                        <p className="font-semibold text-slate-900 text-sm mb-2">{q.question}</p>

                        {/* Options */}
                        {q.options && (
                          <div className="pl-4 space-y-1 mb-2 text-slate-700">
                            {q.options.map((opt) => (
                              <div key={opt.key}>
                                <strong>{opt.key}.</strong> {opt.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Statements for category */}
                        {q.statements && (
                          <div className="pl-4 space-y-1 mb-2 text-slate-700">
                            {q.statements.map((s, sIdx) => (
                              <div key={s.id}>
                                <strong>({sIdx + 1})</strong> {s.statement} &rarr;{' '}
                                <span className="text-emerald-700 font-bold">{s.correctValue}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Answer Key */}
                        <div className="bg-white border border-slate-200 rounded-lg p-2 mt-2 space-y-1 text-slate-800">
                          {q.correctAnswer && (
                            <div>
                              <span className="font-bold text-emerald-700">Kunci Jawaban: </span>
                              <span>{q.correctAnswer}</span>
                            </div>
                          )}
                          {q.correctAnswers && (
                            <div>
                              <span className="font-bold text-purple-700">Kunci Jawaban: </span>
                              <span>{q.correctAnswers.join(', ')}</span>
                            </div>
                          )}
                          {q.acceptedAnswers && (
                            <div>
                              <span className="font-bold text-amber-800">Jawaban Diterima: </span>
                              <span>{q.acceptedAnswers.join(' / ')}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-600">Pembahasan: </span>
                            <span className="text-slate-600">{q.explanation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Panel */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">
                Logged in as <strong>Administrator Guru</strong>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors"
              >
                Tutup Panel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
