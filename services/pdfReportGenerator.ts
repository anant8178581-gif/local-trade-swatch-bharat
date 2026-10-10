import { Worker } from '../types';
import { DailyEarningBar } from '../components/WorkerWalletView';

export interface ReportTransactionItem {
  id: string;
  customer: string;
  service: string;
  date: string;
  amount: number;
  mode: string;
  platformFee: number;
  workerTakeHome: number;
  status: 'received' | 'pending';
  utr?: string;
}

export interface MonthlyReportData {
  worker: Worker;
  monthLabel: string;
  statementId: string;
  generatedAt: string;
  upiId: string;
  planName: string;
  totalMonthlyEarnings: number;
  totalCommissionSaved: number;
  platformCommission: number;
  totalCompletedJobs: number;
  weeklyReceived: number;
  weeklyPending: number;
  dailyBars: DailyEarningBar[];
  transactions: ReportTransactionItem[];
}

/**
 * Escapes characters for PDF literal strings (...)
 */
function escapePdfText(text: string): string {
  return text
    .replace(/₹/g, 'INR ')
    .replace(/•/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Generates a real, standards-compliant PDF 1.4 binary document containing
 * the worker's formatted Monthly Summary of Earnings, Commission Savings,
 * Daily Received vs Pending Breakdown, and Completed Jobs Ledger.
 */
export function generateWorkerMonthlyPdfBlob(data: MonthlyReportData): Blob {
  const ops: string[] = [];

  // Page dimensions: A4 (595 x 842 pt)
  const pageWidth = 595;
  const pageHeight = 842;

  const drawRect = (
    x: number,
    yTop: number,
    w: number,
    h: number,
    fillRgb: [number, number, number],
    strokeRgb?: [number, number, number]
  ) => {
    const yPdf = pageHeight - yTop - h;
    ops.push(`${fillRgb[0].toFixed(3)} ${fillRgb[1].toFixed(3)} ${fillRgb[2].toFixed(3)} rg`);
    if (strokeRgb) {
      ops.push(`${strokeRgb[0].toFixed(3)} ${strokeRgb[1].toFixed(3)} ${strokeRgb[2].toFixed(3)} RG`);
      ops.push(`0.75 w`);
      ops.push(`${x} ${yPdf} ${w} ${h} re B`);
    } else {
      ops.push(`${x} ${yPdf} ${w} ${h} re f`);
    }
  };

  const drawLine = (
    x1: number,
    yTop1: number,
    x2: number,
    yTop2: number,
    strokeRgb: [number, number, number] = [0.88, 0.91, 0.94],
    width = 0.6
  ) => {
    const y1 = pageHeight - yTop1;
    const y2 = pageHeight - yTop2;
    ops.push(`${strokeRgb[0].toFixed(3)} ${strokeRgb[1].toFixed(3)} ${strokeRgb[2].toFixed(3)} RG`);
    ops.push(`${width} w`);
    ops.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };

  const drawText = (
    text: string,
    x: number,
    yTop: number,
    size = 10,
    font: 'F1' | 'F2' = 'F1', // F1 = Helvetica, F2 = Helvetica-Bold
    colorRgb: [number, number, number] = [0.06, 0.09, 0.16]
  ) => {
    const yPdf = pageHeight - yTop;
    const safe = escapePdfText(text);
    ops.push(`BT`);
    ops.push(`/${font} ${size} Tf`);
    ops.push(`${colorRgb[0].toFixed(3)} ${colorRgb[1].toFixed(3)} ${colorRgb[2].toFixed(3)} rg`);
    ops.push(`${x} ${yPdf} Td`);
    ops.push(`(${safe}) Tj`);
    ops.push(`ET`);
  };

  // 1. TOP HEADER BANNER (#0F172A Deep Slate Navy)
  drawRect(0, 0, pageWidth, 88, [0.059, 0.09, 0.165]);
  drawText('LOCAL TRADES INDIA - 0% COMMISSION MARKETPLACE', 36, 26, 9, 'F2', [0.063, 0.725, 0.506]);
  drawText('MONTHLY EARNINGS & FINANCIAL SUMMARY REPORT', 36, 46, 16, 'F2', [1, 1, 1]);
  drawText(
    `Statement Period: ${data.monthLabel}   |   Statement ID: ${data.statementId}   |   Generated: ${data.generatedAt}`,
    36,
    66,
    8.5,
    'F1',
    [0.8, 0.84, 0.9]
  );

  // 2. WORKER PROFILE & VERIFICATION SUMMARY BOX
  drawRect(36, 102, 523, 62, [0.973, 0.98, 0.988], [0.85, 0.88, 0.92]);
  drawText(`Artisan / Professional: ${data.worker.name}`, 48, 120, 10.5, 'F2', [0.059, 0.09, 0.165]);
  drawText(`Primary Trade: ${data.worker.skills.join(', ')}`, 48, 136, 9, 'F1', [0.28, 0.33, 0.41]);
  drawText(`Direct UPI VPA: ${data.upiId}`, 48, 151, 9, 'F1', [0.05, 0.52, 0.36]);

  drawText(`Active Pass: ${data.planName}`, 315, 120, 9.5, 'F2', [0.059, 0.09, 0.165]);
  drawText(`KYC & Trust Status: Verified Identity & PAN`, 315, 136, 9, 'F1', [0.28, 0.33, 0.41]);
  drawText(`Commission Policy: 0% Platform Cut (100% Direct)`, 315, 151, 9, 'F2', [0.05, 0.52, 0.36]);

  // 3. EXECUTIVE SUMMARY KPI CARDS (4 Columns)
  const cardWidth = 124;
  const cardGap = 9;
  const startX = 36;
  const kpiY = 178;

  // Card 1: Total Monthly Earnings
  drawRect(startX, kpiY, cardWidth, 58, [0.93, 0.99, 0.96], [0.65, 0.92, 0.81]);
  drawText('TOTAL EARNINGS', startX + 10, kpiY + 16, 7.5, 'F2', [0.04, 0.45, 0.32]);
  drawText(`INR ${data.totalMonthlyEarnings.toLocaleString('en-IN')}`, startX + 10, kpiY + 35, 13, 'F2', [0.059, 0.09, 0.165]);
  drawText('100% Direct to Worker', startX + 10, kpiY + 49, 7.5, 'F1', [0.04, 0.45, 0.32]);

  // Card 2: Commission Saved
  const c2X = startX + cardWidth + cardGap;
  drawRect(c2X, kpiY, cardWidth, 58, [1.0, 0.98, 0.92], [0.96, 0.82, 0.52]);
  drawText('COMMISSION SAVED', c2X + 10, kpiY + 16, 7.5, 'F2', [0.7, 0.42, 0.04]);
  drawText(`INR ${data.totalCommissionSaved.toLocaleString('en-IN')}`, c2X + 10, kpiY + 35, 13, 'F2', [0.55, 0.31, 0.03]);
  drawText('Saved vs 20-25% Apps', c2X + 10, kpiY + 49, 7.5, 'F1', [0.7, 0.42, 0.04]);

  // Card 3: Platform Fee Deducted
  const c3X = startX + (cardWidth + cardGap) * 2;
  drawRect(c3X, kpiY, cardWidth, 58, [0.96, 0.97, 0.99], [0.82, 0.86, 0.92]);
  drawText('PLATFORM CUT', c3X + 10, kpiY + 16, 7.5, 'F2', [0.28, 0.33, 0.41]);
  drawText('INR 0 (0%)', c3X + 10, kpiY + 35, 13, 'F2', [0.05, 0.55, 0.38]);
  drawText('Zero Middleman Fee', c3X + 10, kpiY + 49, 7.5, 'F1', [0.28, 0.33, 0.41]);

  // Card 4: Completed Jobs
  const c4X = startX + (cardWidth + cardGap) * 3;
  drawRect(c4X, kpiY, cardWidth, 58, [0.96, 0.97, 0.99], [0.82, 0.86, 0.92]);
  drawText('COMPLETED JOBS', c4X + 10, kpiY + 16, 7.5, 'F2', [0.28, 0.33, 0.41]);
  drawText(`${data.totalCompletedJobs} Jobs`, c4X + 10, kpiY + 35, 13, 'F2', [0.059, 0.09, 0.165]);
  drawText(`Rating: ${data.worker.rating.toFixed(1)} / 5.0 Stars`, c4X + 10, kpiY + 49, 7.5, 'F1', [0.28, 0.33, 0.41]);

  // 4. SECTION 1: 7-DAY PAYMENT OVERVIEW BREAKDOWN (RECEIVED VS PENDING)
  let currentY = 256;
  drawText('1. DAILY EARNINGS BREAKDOWN (RECEIVED VS PENDING STATUS)', 36, currentY, 10.5, 'F2', [0.059, 0.09, 0.165]);
  currentY += 10;

  // Table Header
  drawRect(36, currentY, 523, 20, [0.059, 0.09, 0.165]);
  drawText('Day', 46, currentY + 13, 8.5, 'F2', [1, 1, 1]);
  drawText('Completed Jobs', 160, currentY + 13, 8.5, 'F2', [1, 1, 1]);
  drawText('Received (Settled)', 270, currentY + 13, 8.5, 'F2', [0.4, 0.95, 0.72]);
  drawText('Pending (Unsettled)', 390, currentY + 13, 8.5, 'F2', [0.98, 0.82, 0.4]);
  drawText('Daily Total', 490, currentY + 13, 8.5, 'F2', [1, 1, 1]);
  currentY += 20;

  data.dailyBars.forEach((bar, index) => {
    const rowBg: [number, number, number] = index % 2 === 0 ? [1, 1, 1] : [0.975, 0.982, 0.99];
    drawRect(36, currentY, 523, 18, rowBg, [0.91, 0.93, 0.96]);
    const dayTotal = bar.received + bar.pending;
    drawText(bar.fullDate, 46, currentY + 12, 8.5, 'F1', [0.15, 0.2, 0.28]);
    drawText(`${bar.jobsCount} Jobs`, 160, currentY + 12, 8.5, 'F1', [0.28, 0.33, 0.41]);
    drawText(`INR ${bar.received.toLocaleString('en-IN')}`, 270, currentY + 12, 8.5, 'F2', [0.04, 0.52, 0.35]);
    drawText(
      bar.pending > 0 ? `INR ${bar.pending.toLocaleString('en-IN')}` : 'INR 0 (Settled)',
      390,
      currentY + 12,
      8.5,
      bar.pending > 0 ? 'F2' : 'F1',
      bar.pending > 0 ? [0.75, 0.42, 0.04] : [0.55, 0.6, 0.68]
    );
    drawText(`INR ${dayTotal.toLocaleString('en-IN')}`, 490, currentY + 12, 8.5, 'F2', [0.059, 0.09, 0.165]);
    currentY += 18;
  });

  // 7-Day Total Footer Row
  drawRect(36, currentY, 523, 20, [0.93, 0.96, 0.99], [0.78, 0.84, 0.9]);
  const totalJobs7d = data.dailyBars.reduce((acc, b) => acc + b.jobsCount, 0);
  drawText('7-Day Summary Total', 46, currentY + 13, 8.5, 'F2', [0.059, 0.09, 0.165]);
  drawText(`${totalJobs7d} Jobs`, 160, currentY + 13, 8.5, 'F2', [0.059, 0.09, 0.165]);
  drawText(`INR ${data.weeklyReceived.toLocaleString('en-IN')}`, 270, currentY + 13, 8.5, 'F2', [0.04, 0.52, 0.35]);
  drawText(`INR ${data.weeklyPending.toLocaleString('en-IN')}`, 390, currentY + 13, 8.5, 'F2', [0.75, 0.42, 0.04]);
  drawText(
    `INR ${(data.weeklyReceived + data.weeklyPending).toLocaleString('en-IN')}`,
    490,
    currentY + 13,
    8.5,
    'F2',
    [0.059, 0.09, 0.165]
  );
  currentY += 34;

  // 5. SECTION 2: COMPLETED JOBS & DIRECT PAYOUT LEDGER
  drawText('2. COMPLETED JOBS & DIRECT CUSTOMER PAYOUT LEDGER (0% PLATFORM FEE)', 36, currentY, 10.5, 'F2', [0.059, 0.09, 0.165]);
  currentY += 10;

  drawRect(36, currentY, 523, 20, [0.059, 0.09, 0.165]);
  drawText('Date', 44, currentY + 13, 8, 'F2', [1, 1, 1]);
  drawText('Customer', 115, currentY + 13, 8, 'F2', [1, 1, 1]);
  drawText('Service Completed', 205, currentY + 13, 8, 'F2', [1, 1, 1]);
  drawText('Payment Mode', 350, currentY + 13, 8, 'F2', [1, 1, 1]);
  drawText('Status', 452, currentY + 13, 8, 'F2', [1, 1, 1]);
  drawText('Take-Home', 502, currentY + 13, 8, 'F2', [0.4, 0.95, 0.72]);
  currentY += 20;

  const maxRows = Math.min(data.transactions.length, 10);
  for (let i = 0; i < maxRows; i++) {
    const tx = data.transactions[i];
    const rowBg: [number, number, number] = i % 2 === 0 ? [1, 1, 1] : [0.975, 0.982, 0.99];
    drawRect(36, currentY, 523, 19, rowBg, [0.91, 0.93, 0.96]);

    drawText(tx.date.slice(0, 14), 44, currentY + 13, 8, 'F1', [0.28, 0.33, 0.41]);
    drawText(tx.customer.slice(0, 16), 115, currentY + 13, 8, 'F2', [0.1, 0.14, 0.22]);
    drawText(tx.service.slice(0, 26), 205, currentY + 13, 8, 'F1', [0.2, 0.25, 0.33]);
    drawText(tx.mode.slice(0, 19), 350, currentY + 13, 7.5, 'F1', [0.28, 0.33, 0.41]);
    drawText(
      tx.status.toUpperCase(),
      452,
      currentY + 13,
      7.5,
      'F2',
      tx.status === 'received' ? [0.04, 0.52, 0.35] : [0.75, 0.42, 0.04]
    );
    drawText(`INR ${tx.workerTakeHome.toLocaleString('en-IN')}`, 502, currentY + 13, 8.5, 'F2', [0.059, 0.09, 0.165]);
    currentY += 19;
  }

  // 6. BOTTOM ZERO-COMMISSION CERTIFICATION STAMP
  const footerY = 755;
  drawLine(36, footerY - 8, 559, footerY - 8, [0.8, 0.85, 0.9], 1);
  drawRect(36, footerY, 523, 52, [0.94, 0.99, 0.97], [0.65, 0.9, 0.78]);
  drawText(
    'CERTIFIED 0% COMMISSION FINANCIAL STATEMENT - LOCAL TRADES INDIA',
    48,
    footerY + 16,
    8.5,
    'F2',
    [0.04, 0.45, 0.32]
  );
  drawText(
    `This report certifies that ${data.worker.name} retained 100% of job payouts (INR ${data.totalMonthlyEarnings.toLocaleString('en-IN')}) directly via UPI/Cash`,
    48,
    footerY + 30,
    8,
    'F1',
    [0.2, 0.28, 0.35]
  );
  drawText(
    `with INR 0 platform commission deducted, saving an estimated INR ${data.totalCommissionSaved.toLocaleString('en-IN')} compared to traditional 20% commission apps.`,
    48,
    footerY + 42,
    8,
    'F1',
    [0.2, 0.28, 0.35]
  );

  const contentStream = ops.join('\n');

  // Construct valid PDF 1.4 objects
  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`
  );
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  objects.push(
    `6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

/**
 * Triggers a direct browser file download of the generated PDF report
 */
export function triggerPdfReportDownload(data: MonthlyReportData): string {
  const blob = generateWorkerMonthlyPdfBlob(data);
  const url = URL.createObjectURL(blob);
  const cleanName = data.worker.name.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanMonth = data.monthLabel.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `LocalTradesIndia_Monthly_Report_${cleanName}_${cleanMonth}.pdf`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return filename;
}
