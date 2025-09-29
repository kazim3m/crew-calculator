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

// Show hotel dates as a range
function generateHotelDates(outbound: string, inbound: string, hotelNights: number): string {
  if (hotelNights <= 0) return '';
  const start = new Date(outbound);
  const end = new Date(inbound);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  return `${startStr} → ${endStr}`;
}

// Map transport mode strings to numbers
const mapTransport = (mode?: string): number => {
  if (!mode) return 0;
  if (mode.includes('No Trip')) return 0;
  if (mode.toLowerCase().includes('out')) return 1;
  if (mode.toLowerCase().includes('2')) return 2;
  return 0;
};

// Build combined rows
function buildCombinedTableData(data: ExportData): CombinedTableRow[] {
  const combinedData: CombinedTableRow[] = [];

  // Crew rows
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

  // Labour rows
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

  // Sort by outbound date
  combinedData.sort((a, b) => new Date(a.outbound).getTime() - new Date(b.outbound).getTime());
  return combinedData;
}

// --- PDF Export (kept minimal since hidden in UI) ---
export function exportToPDF(data: ExportData) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdf.text('PDF Export (disabled in UI)', 20, 20);
  pdf.save(`${data.eventName || 'Project'}_Crew_Calculator.pdf`);
}

// --- Excel Export ---
export function exportToExcel(data: ExportData) {
  const tableData = buildCombinedTableData(data);

  const headers = [
    'Type',
    'Frame Name',
    'Outbound',
    'Inbound',
    'Crew Name',
    'Crew Count',
    'Per Diems',
    'Inner Trips',
    'Outside Trips',
    'Labour Transport Trips',
    'Hotel Nights',
    'Hotel Dates',
  ];

  const dataRows = tableData.map((row) => [
    row.type,
    row.frameName,
    row.outbound,
    row.inbound,
    row.names,
    row.crewCount,
    row.perDiems,
    row.innerTrips,
    row.outsideTransportTrips,
    row.type === 'Labour' ? mapTransport(row.mode) : '',
    row.hotelNights,
    row.hotelDates,
  ]);

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
    [`Export Date: ${new Date().toLocaleDateString()}`],
    [],
    headers,
    ...dataRows,
    totalsRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Styling
  const border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  };
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
  const cellStyle = { border };

  const range = XLSX.utils.decode_range(ws['!ref']!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      if (R === 4) ws[cellRef].s = headerStyle; // headers
      else if (R === range.e.r) ws[cellRef].s = totalStyle; // totals
      else if (R > 4) ws[cellRef].s = cellStyle; // body
      else ws[cellRef].s = { font: { bold: true } }; // project info
    }
  }

  // Merge totals row A–E
  const lastRow = range.e.r;
  ws['!merges'] = ws['!merges'] || [];
  ws['!merges'].push({ s: { r: lastRow, c: 0 }, e: { r: lastRow, c: 4 } });

  // Column widths
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Crew Calculator');
  XLSX.writeFile(wb, `${data.eventName || 'Project'}_Crew_Calculator.xlsx`);
}
