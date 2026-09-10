import { jsPDF } from 'jspdf';
import { Question, StudentSubmission } from '../types';

/**
 * Generates an official Question Sheet PDF for SD Negeri 3 Loloan Timur
 */
export function generateQuestionsPDF(questions: Question[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header / Kop Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(15);
  doc.text('SD NEGERI 3 LOLOAN TIMUR', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Kecamatan Negara, Kabupaten Jembrana, Bali', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setLineWidth(0.8);
  doc.line(15, y, pageWidth - 15, y);
  y += 1;
  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);
  y += 7;

  // Judul Naskah Soal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LEMBAR SOAL TES SUMATIF', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Info Ujian
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  doc.text('Mata Pelajaran : Bahasa Indonesia', 15, y);
  doc.text('Kelas / Semester : II (Dua) / Ganjil', 120, y);
  y += 5;
  doc.text('Materi Pokok   : Menjaga Kesehatan', 15, y);
  doc.text('KKTP             : 70', 120, y);
  y += 5;
  doc.text('Jumlah Soal    : 35 Butir Soal', 15, y);
  doc.text('Tahun Ajaran    : 2024 / 2025', 120, y);
  y += 7;

  doc.setLineWidth(0.2);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Petunjuk
  doc.setFont('helvetica', 'bold');
  doc.text('PETUNJUK UMUM:', 15, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('1. Tulislah nama lengkap dan nomor absenmu dengan rapi pada lembar jawaban.', 18, y);
  y += 4.5;
  doc.text('2. Bacalah setiap pertanyaan dengan teliti sebelum menjawab.', 18, y);
  y += 4.5;
  doc.text('3. Kerjakan terlebih dahulu soal yang kamu anggap paling mudah.', 18, y);
  y += 6;

  // Render Questions
  let currentSection = '';

  questions.forEach((q, index) => {
    // Check page overflow
    if (y > 270) {
      doc.addPage();
      y = 15;
    }

    // Section title
    let sectionTitle = '';
    if (q.type === 'pilihan_ganda' && currentSection !== 'PG') {
      currentSection = 'PG';
      sectionTitle = 'BAGIAN A: PILIHAN GANDA (Pilihlah salah satu jawaban yang paling tepat!)';
    } else if (q.type === 'pilihan_ganda_kompleks' && currentSection !== 'PGK') {
      currentSection = 'PGK';
      sectionTitle = 'BAGIAN B: PILIHAN GANDA KOMPLEKS (Pilihlah lebih dari 1 jawaban yang benar!)';
    } else if (q.type === 'kompleks_kategori' && currentSection !== 'KAT') {
      currentSection = 'KAT';
      sectionTitle = 'BAGIAN C: PILIHAN GANDA KATEGORI (Tentukan respon pada setiap pernyataan!)';
    } else if (q.type === 'isian_singkat' && currentSection !== 'IS') {
      currentSection = 'IS';
      sectionTitle = 'BAGIAN D: ISIAN SINGKAT (Jawablah pertanyaan berikut dengan singkat dan tepat!)';
    }

    if (sectionTitle) {
      if (y > 255) {
        doc.addPage();
        y = 15;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setFillColor(240, 245, 255);
      doc.rect(15, y - 4, pageWidth - 30, 7, 'F');
      doc.text(sectionTitle, 17, y + 1);
      y += 8;
    }

    // Question number and text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const qNumText = `${index + 1}. `;
    const qLines = doc.splitTextToSize(q.question, pageWidth - 30 - 8);

    doc.setFont('helvetica', 'bold');
    doc.text(qNumText, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(qLines, 22, y);
    y += qLines.length * 4.5 + 2;

    // Options or statements
    if (q.type === 'pilihan_ganda' || q.type === 'pilihan_ganda_kompleks') {
      q.options?.forEach((opt) => {
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        const optText = `${opt.key}. ${opt.text}`;
        doc.text(optText, 25, y);
        y += 4.5;
      });
      y += 2;
    } else if (q.type === 'kompleks_kategori') {
      q.statements?.forEach((stmt, sIdx) => {
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        const stmtText = `[ ${q.categoryType || 'Respon'} ] (${sIdx + 1}) ${stmt.statement}`;
        const sLines = doc.splitTextToSize(stmtText, pageWidth - 45);
        doc.text(sLines, 25, y);
        y += sLines.length * 4.5;
      });
      y += 2;
    } else if (q.type === 'isian_singkat') {
      doc.text('Jawaban: ............................................................................', 25, y);
      y += 6;
    }
  });

  doc.save('Naskah_Soal_Bahasa_Indonesia_Kelas2_SDN3_Loloan_Timur.pdf');
}

/**
 * Generates an official Result Card / Certificate PDF for the student
 */
export function generateStudentResultPDF(submission: StudentSubmission): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(15);
  doc.text('SD NEGERI 3 LOLOAN TIMUR', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Kecamatan Negara, Kabupaten Jembrana, Bali', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setLineWidth(0.8);
  doc.line(18, y, pageWidth - 18, y);
  y += 1;
  doc.setLineWidth(0.3);
  doc.line(18, y, pageWidth - 18, y);
  y += 10;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SURAT HASIL EVALUASI TES SUMATIF', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tahun Ajaran 2024/2025`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Student Identity Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(18, y, pageWidth - 36, 42, 3, 3, 'FD');

  const idX1 = 24;
  const idX2 = 65;
  let idY = y + 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Nama Siswa', idX1, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${submission.studentName}`, idX2, idY);
  idY += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Nomor Absen', idX1, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${submission.absentNumber}`, idX2, idY);
  idY += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Kelas / Satuan Pendidikan', idX1, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: Kelas ${submission.grade} / ${submission.school}`, idX2, idY);
  idY += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Mata Pelajaran / Materi', idX1, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${submission.subject} (${submission.theme})`, idX2, idY);
  idY += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Waktu Penyelesaian', idX1, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${submission.timestamp}`, idX2, idY);

  y += 50;

  // Score Highlight Card
  doc.setFillColor(submission.status === 'Lulus' ? 240 : 254, submission.status === 'Lulus' ? 253 : 242, submission.status === 'Lulus' ? 244 : 242);
  doc.setDrawColor(submission.status === 'Lulus' ? 34 : 239, submission.status === 'Lulus' ? 197 : 68, submission.status === 'Lulus' ? 94 : 68);
  doc.roundedRect(18, y, pageWidth - 36, 48, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('PEROLEHAN NILAI AKHIR SISWA', pageWidth / 2, y + 10, { align: 'center' });

  doc.setFontSize(36);
  if (submission.status === 'Lulus') {
    doc.setTextColor(22, 101, 52); // Green
  } else {
    doc.setTextColor(185, 28, 28); // Red
  }
  doc.text(`${submission.finalScore}`, pageWidth / 2, y + 25, { align: 'center' });

  doc.setFontSize(12);
  const statusText = submission.status === 'Lulus' ? 'STATUS: LULUS (TUNTAS KKTP)' : 'STATUS: BELUM LULUS (PERLU REMEDIAL)';
  doc.text(statusText, pageWidth / 2, y + 36, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) = 70`, pageWidth / 2, y + 43, { align: 'center' });

  y += 58;

  // Breakdown Table
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Rincian Capaian Hasil Pengerjaan:', 20, y);
  y += 5;

  const tableHeaders = ['Keterangan Indikator', 'Jumlah / Capaian'];
  const tableData = [
    ['Total Butir Soal Dikerjakan', `${submission.totalQuestions} Butir Soal`],
    ['Jumlah Jawaban Benar', `${submission.correctCount} Soal`],
    ['Jumlah Jawaban Salah', `${submission.incorrectCount} Soal`],
    ['Nilai Akhir (Skala 0 - 100)', `${submission.finalScore}`],
    ['Standar Kelulusan (KKTP)', '70'],
    ['Keterangan Kelulusan', submission.status],
  ];

  doc.setFontSize(9.5);
  tableData.forEach(([label, val], idx) => {
    const rowY = y + idx * 7.5;
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(18, rowY - 5, pageWidth - 36, 7.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(18, rowY - 5, pageWidth - 36, 7.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.text(label, 22, rowY);
    doc.setFont('helvetica', 'bold');
    doc.text(val, pageWidth - 24, rowY, { align: 'right' });
  });

  y += tableData.length * 7.5 + 20;

  // Signatures
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Negara, ${dateStr}`, pageWidth - 65, y);
  y += 5;
  doc.text('Guru Kelas II,', pageWidth - 65, y);
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.text('(.......................................)', pageWidth - 65, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('NIP. ...................................', pageWidth - 65, y);

  doc.save(`Hasil_Tes_Sumatif_${submission.studentName.replace(/\s+/g, '_')}_Absen${submission.absentNumber}.pdf`);
}
