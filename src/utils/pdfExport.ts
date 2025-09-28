import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { CrewFrame, LabourFrame, EventLocation, TotalCalculation, CrewCalculation, LabourCalculation } from '@/types/eventCalculator';

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
  perDiems: number;
  hotelNights: number;
  hotelDates: string;
  innerTrips: number | string;
  outsideTransportTrips: number;
}

// Helper function to generate hotel dates
function generateHotelDates(outbound: string, inbound: string, hotelNights: number): string {
  if (hotelNights <= 0) return '';
  
  const dates = [];
  const startDate = new Date(outbound);
  
  for (let i = 0; i < hotelNights; i++) {
    const hotelDate = new Date(startDate);
    hotelDate.setDate(startDate.getDate() + i);
    dates.push(hotelDate.toISOString().split('T')[0]);
  }
  
  return dates.join(', ');
}

// Helper function to build combined table data
function buildCombinedTableData(data: ExportData): CombinedTableRow[] {
  const combinedData: CombinedTableRow[] = [];
  
  // Add crew frames
  data.crewFrames.forEach((frame, index) => {
    const calc = data.crewCalculations[index];
    const names = frame.crewNames.filter(name => name.trim()).join(', ');
    const hotelDates = generateHotelDates(frame.outbound, frame.inbound, calc.hotelNights);
    
    combinedData.push({
      type: 'Crew',
      frameName: frame.name,
      names: names,
      outbound: frame.outbound,
      inbound: frame.inbound,
      mode: '', // Crew rows leave mode blank
      perDiems: calc.perDiems,
      hotelNights: calc.hotelNights,
      hotelDates: hotelDates,
      innerTrips: calc.innerTrips,
      outsideTransportTrips: calc.outsideTrips
    });
  });
  
  // Add labour frames
  data.labourFrames.forEach((frame, index) => {
    const calc = data.labourCalculations[index];
    const names = frame.labourNames.filter(name => name.trim()).join(', ');
    const hotelDates = generateHotelDates(frame.outbound, frame.inbound, calc.hotelNights);
    
    combinedData.push({
      type: 'Labour',
      frameName: frame.name,
      names: names,
      outbound: frame.outbound,
      inbound: frame.inbound,
      mode: frame.mode, // Labour rows show transport mode
      perDiems: calc.perDiems,
      hotelNights: calc.hotelNights,
      hotelDates: hotelDates,
      innerTrips: '', // Labour rows leave inner trips blank
      outsideTransportTrips: calc.transportTrips
    });
  });
  
  // Sort by outbound date (earliest first)
  combinedData.sort((a, b) => new Date(a.outbound).getTime() - new Date(b.outbound).getTime());
  
  return combinedData;
}

export function exportToPDF(data: ExportData) {
  const pdf = new jsPDF();
  const tableData = buildCombinedTableData(data);
  
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const leftMargin = 10;
  const rightMargin = 10;
  
  // Header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3Monkeys Crew Calculator', rightMargin, 15);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Project: ${data.eventName || 'Untitled Project'}`, rightMargin, 25);
  pdf.text(`Location: ${data.eventLocation}`, rightMargin, 32);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, rightMargin, 39);
  
  yPosition = 50;
  
  // Table headers
  const headers = [
    'Type', 'Frame Name', 'Names', 'Outbound', 'Inbound', 'Mode',
    'Per Diems', 'Hotel Nights', 'Hotel Dates', 'Inner Trips', 'Outside/Transport Trips'
  ];
  
  const columnWidths = [15, 25, 30, 20, 20, 35, 18, 20, 35, 18, 25];
  const rowHeight = 6;
  
  // Draw table headers
  pdf.setFillColor(220, 220, 220);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  
  let xPos = leftMargin;
  headers.forEach((header, i) => {
    pdf.rect(xPos, yPosition - 4, columnWidths[i], rowHeight, 'F');
    pdf.text(header, xPos + 1, yPosition);
    xPos += columnWidths[i];
  });
  
  yPosition += rowHeight;
  
  // Draw table rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  tableData.forEach((row) => {
    // Check for page break
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    xPos = leftMargin;
    const rowData = [
      row.type,
      row.frameName,
      row.names,
      row.outbound,
      row.inbound,
      row.mode,
      row.perDiems.toString(),
      row.hotelNights.toString(),
      row.hotelDates,
      row.innerTrips.toString(),
      row.outsideTransportTrips.toString()
    ];
    
    rowData.forEach((cellData, i) => {
      pdf.rect(xPos, yPosition - 4, columnWidths[i], rowHeight);
      // Truncate text if too long
      const maxLength = Math.floor(columnWidths[i] / 2);
      const displayText = cellData.length > maxLength ? cellData.substring(0, maxLength - 3) + '...' : cellData;
      pdf.text(displayText, xPos + 1, yPosition);
      xPos += columnWidths[i];
    });
    
    yPosition += rowHeight;
  });
  
  // Add totals row
  yPosition += 5;
  if (yPosition > 270) {
    pdf.addPage();
    yPosition = 20;
  }
  
  pdf.setFillColor(200, 200, 200);
  pdf.setFont('helvetica', 'bold');
  
  const totalInnerTrips = data.totals.totalInnerTrips;
  const totalOutsideTransportTrips = data.totals.totalOutsideTrips + data.totals.totalLabourTrips;
  
  xPos = leftMargin;
  const totalsData = [
    'TOTALS', '', '', '', '', '',
    data.totals.totalPerDiems.toString(),
    data.totals.totalHotelNights.toString(),
    '',
    totalInnerTrips.toString(),
    totalOutsideTransportTrips.toString()
  ];
  
  totalsData.forEach((cellData, i) => {
    pdf.rect(xPos, yPosition - 4, columnWidths[i], rowHeight, 'F');
    pdf.text(cellData, xPos + 1, yPosition);
    xPos += columnWidths[i];
  });
  
  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    const footerY = pdf.internal.pageSize.height - 10;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text('Generated by 3Monkeys Crew Calculator', leftMargin, footerY);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin - 20, footerY);
  }
  
  // Save the PDF
  const fileName = `${data.eventName || 'Project'}_Crew_Calculator.pdf`;
  pdf.save(fileName);
}

export function exportToExcel(data: ExportData) {
  const tableData = buildCombinedTableData(data);
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Headers
  const headers = [
    'Type (Crew/Labour)', 'Frame Name', 'Names', 'Outbound', 'Inbound', 'Mode',
    'Per Diems', 'Hotel Nights', 'Hotel Dates', 'Inner Trips', 'Outside/Transport Trips'
  ];
  
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
  
  // Data rows
  const dataRows = tableData.map(row => [
    row.type,
    row.frameName,
    row.names,
    row.outbound,
    row.inbound,
    row.mode,
    row.perDiems,
    row.hotelNights,
    row.hotelDates,
    row.innerTrips,
    row.outsideTransportTrips
  ]);
  
  XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: 'A2' });
  
  // Totals row
  const totalInnerTrips = data.totals.totalInnerTrips;
  const totalOutsideTransportTrips = data.totals.totalOutsideTrips + data.totals.totalLabourTrips;
  
  const totalsRow = [
    'TOTALS', '', '', '', '', '',
    data.totals.totalPerDiems,
    data.totals.totalHotelNights,
    '',
    totalInnerTrips,
    totalOutsideTransportTrips
  ];
  
  const nextRow = dataRows.length + 2;
  XLSX.utils.sheet_add_aoa(ws, [totalsRow], { origin: `A${nextRow}` });
  
  // Format totals row in bold (basic formatting)
  const range = XLSX.utils.decode_range(ws['!ref']!);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Crew Calculator');
  
  // Save the Excel file
  const fileName = `${data.eventName || 'Project'}_Crew_Calculator.xlsx`;
  XLSX.writeFile(wb, fileName);
}
