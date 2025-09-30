import jsPDF from 'jspdf';
import * as XLSX from 'xlsx-js-style';
import {
  CrewFrame,
  LabourFrame,
  EventLocation,
  TotalCalculation,
  CrewCalculation,
  LabourCalculation,
} from '@/types/eventCalculator';

interface ExportData {
  eventName: string;
  eventLocation: EventLocation;
  crewFrames: CrewFrame[];
  labourFrames: LabourFrame[];
  crewCalculations: CrewCalculation[];
  labourCalculations: LabourCalculation[];
  totals: TotalCalculation;
}

interface CombinedTableRow {
  type: 'Crew' | 'Labour';
  frameName: string;
  names: string;
  outbound: string;
  inbound: string;
  mode: string;
  crewCount: number;
  perDiems: number;
  innerTrips: number | string;
  outsideTransportTrips: number;
  hotelNights: number;
  hotelDates: string;
}

// --- Helper Functions ---
function generateHotelDates(outbound: string, inbound: string, hotelNights: number): string {
  if (hotelNights <= 0) return '';
  const start = new Date(outbound);
  const end = new Date(inbound);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  return `${startStr} → ${endStr}`;
}

const mapTransport = (mode?: string): number => {
  if (!mode) return 0;
  if (mode.includes('No Trip')) return 0;
  if (mode.toLowerCase().includes('out')) return 1;
  if (mode.toLowerCase().includes('2')) return 2;
  return 0;
};

function buildCombinedTableData(data: ExportData): CombinedTableRow[] {
  const combinedData: CombinedTableRow[] = [];

  data.crewFrames.forEach((frame, index) => {
    const calc = data.crewCalculations[index];
    const names = frame.crewNames.filter((name) => name.trim()).join(', ');
    const hotelDates = generateHotelDates(frame.outbound, frame.inbound, calc.hotelNights);

    combinedData.push({
      type: 'Crew',
      frameName: frame.name,
      names,
      outbound: frame.outbound,
      inbound: frame.inbound,
      mode: '',
      crewCount: calc.crewCount,
      perDiems: calc.perDiems,
      innerTrips: calc.innerTrips,
      outsideTransportTrips: calc.outsideTrips,
      hotelNights: calc.hotelNights,
      hotelDates,
    });
  });

  data.labourFrames.forEach((frame, index) => {
    const calc = data.labourCalculations[index];
    const names = frame.labourNames.filter((name) => name.trim()).join(', ');
    const hotelDates = generateHotelDates(frame.outbound, frame.inbound, calc.hotelNights);

    combinedData.push({
      type: 'Labour',
      frameName: frame.name,
      names,
      outbound: frame.outbound,
      inbound: frame.inbound,
      mode: frame.mode,
      crewCount: calc.labourCount,
      perDiems: calc.perDiems,
      innerTrips: '',
      outsideTransportTrips: calc.transportTrips,
      hotelNights: calc.hotelNights,
      hotelDates,
    });
  });

  combinedData.sort((a, b) => new Date(a.outbound).getTime() - new Date(b.outbound).getTime());
  return combinedData;
}

// --- PDF Export (unchanged, placeholder) ---
export function exportToPDF(data: ExportData) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdf.text('PDF Export (disabled in UI)', 20, 20);
  pdf.save(`${data.eventName || 'Project'}_Crew_Calculator.pdf`);
}

//import * as XLSX from 'xlsx-js-style';

// --- Excel Export ---
export function exportToExcel(data) {
  const headers = [
    'Type',
    'Frame Name',
    'Outbound',
    'Inbound',
    'Name',
    'Count',
    'Per Diems',
    'Inner Trips',
    'Outside Trips',
    'Labour Transport Trips',
    'Hotel Nights',
    'Hotel Dates',
  ];

  const dataRows: any[][] = [];

  // Crew frames -> each crew name in its own row
  data.crewFrames.forEach((frame, idx) => {
    const calc = data.crewCalculations[idx];
    const perDiemEach = calc.crewCount > 0 ? calc.perDiems / calc.crewCount : 0;
    frame.crewNames.filter(name => name.trim()).forEach((name) => {
      dataRows.push([
        'Crew',
        frame.name,
        frame.outbound,
        frame.inbound,
        name,
        1,
        perDiemEach,
        calc.innerTrips,
        calc.outsideTrips,
        '',
        calc.hotelNights,
        generateHotelDates(frame.outbound, frame.inbound, calc.hotelNights),
      ]);
    });
  });

  // Labour frames -> each labour name in its own row
  data.labourFrames.forEach((frame, idx) => {
    const calc = data.labourCalculations[idx];
    const perDiemEach = calc.labourCount > 0 ? calc.perDiems / calc.labourCount : 0;
    frame.labourNames.filter(name => name.trim()).forEach((name) => {
      dataRows.push([
        'Labour',
        frame.name,
        frame.outbound,
        frame.inbound,
        name,
        1,
        perDiemEach,
        '',
        '',
        mapTransport(frame.mode),
        calc.hotelNights,
        generateHotelDates(frame.outbound, frame.inbound, calc.hotelNights),
      ]);
    });
  });

  // Totals row
  const totalsRow = [
    'TOTALS',
    '',
    '',
    '',
    '',
    data.totals.totalCrewCount,
    data.totals.totalPerDiems,
    data.totals.totalInnerTrips,
    data.totals.totalOutsideTrips,
    data.labourFrames.reduce((a, b) => a + mapTransport(b.mode), 0),
    data.totals.totalHotelNights,
    '',
  ];

  const worksheetData = [
    [`Project: ${data.eventName || 'Untitled Project'}`],
    [`Location: ${data.eventLocation}`],
    [`Export Date: ${new Date().toLocaleDateString('en-CA')}`],
    [],
    headers,
    ...dataRows,
    totalsRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // --- Formatting ---
  const border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'DDDDDD' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border,
  };
  const totalStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'F2F2F2' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border,
  };
  const cellStyle = { border, alignment: { vertical: 'center', horizontal: 'center' } };
  const infoStyle = { font: { bold: true }, alignment: { horizontal: 'left' } };
  const altRowStyle = {
    fill: { fgColor: { rgb: 'F9F9F9' } },
    border,
    alignment: { vertical: 'center', horizontal: 'center' },
  };

  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      if (R === 4) ws[cellRef].s = headerStyle;             // headers
      else if (R === range.e.r) ws[cellRef].s = totalStyle; // totals
      else if (R > 4) {
        ws[cellRef].s = (R % 2 === 0) ? altRowStyle : cellStyle;
      } else if (R < 4) {
        ws[cellRef].s = infoStyle;                          // project info
      }
    }
  }

  // Merge "TOTALS" row A–E
  const lastRow = range.e.r;
  ws['!merges'] = ws['!merges'] || [];
  ws['!merges'].push({ s: { r: lastRow, c: 0 }, e: { r: lastRow, c: 4 } });

  // Merge group cells (Type, Frame Name, Outbound, Inbound)
  const startDataRow = 5;
  let currentIndex = startDataRow;
  while (currentIndex < lastRow) {
    const type = ws[XLSX.utils.encode_cell({ r: currentIndex, c: 0 })]?.v;
    const frameName = ws[XLSX.utils.encode_cell({ r: currentIndex, c: 1 })]?.v;

    let groupEnd = currentIndex;
    while (
      groupEnd + 1 < lastRow &&
      ws[XLSX.utils.encode_cell({ r: groupEnd + 1, c: 0 })]?.v === type &&
      ws[XLSX.utils.encode_cell({ r: groupEnd + 1, c: 1 })]?.v === frameName
    ) {
      groupEnd++;
    }

    if (groupEnd > currentIndex) {
      ws['!merges'].push(
        { s: { r: currentIndex, c: 0 }, e: { r: groupEnd, c: 0 } }, // Type
        { s: { r: currentIndex, c: 1 }, e: { r: groupEnd, c: 1 } }, // Frame Name
        { s: { r: currentIndex, c: 2 }, e: { r: groupEnd, c: 2 } }, // Outbound
        { s: { r: currentIndex, c: 3 }, e: { r: groupEnd, c: 3 } }, // Inbound
      );
    }

    currentIndex = groupEnd + 1;
  }

  // Column widths (auto-size)
  ws['!cols'] = headers.map((header, idx) => {
    let maxLen = header.length;
    for (let r = startDataRow; r <= lastRow; ++r) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: idx })];
      if (cell && cell.v) maxLen = Math.max(maxLen, String(cell.v).length);
    }
    return { wch: maxLen + 2 };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Crew Calculator');
  XLSX.writeFile(wb, `${data.eventName || 'Project'}_Crew_Calculator.xlsx`);
}
