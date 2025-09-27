import jsPDF from 'jspdf';
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

export function exportToPDF(data: ExportData) {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const leftMargin = 20;
  const rightMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // Helper functions
  const addLine = (text: string, fontSize = 12, isBold = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) pdf.setFont('helvetica', 'bold');
    else pdf.setFont('helvetica', 'normal');
    pdf.text(text, leftMargin, yPosition);
    yPosition += fontSize * 0.6;
  };

  const addSeparator = () => {
    yPosition += 5;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
    yPosition += 10;
  };

  const checkPageBreak = () => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  addLine('3Monkeys Crew Calculator Report', 18, true);
  yPosition += 10;

  // Event Details
  addLine('Event Information', 14, true);
  addLine(`Event Name: ${data.eventName || 'Untitled Event'}`);
  addLine(`Event Location: ${data.eventLocation}`);
  addSeparator();

  // Crew Frames
  if (data.crewFrames.length > 0) {
    // Add gray background header
    pdf.setFillColor(245, 245, 245);
    pdf.rect(leftMargin, yPosition - 5, contentWidth, 15, 'F');
    addLine('Crew Time Frames', 14, true);
    
    data.crewFrames.forEach((frame, index) => {
      checkPageBreak();
      const calc = data.crewCalculations[index];
      
      addLine(`${frame.name}`, 12, true);
      addLine(`Dates: ${frame.outbound} to ${frame.inbound}`);
      addLine(`Crew Count: ${frame.count}`);
      
      if (frame.crewNames.length > 0) {
        const crewNamesList = frame.crewNames.filter(name => name.trim());
        if (crewNamesList.length > 0) {
          addLine(`Crew Names:`);
          crewNamesList.forEach(name => {
            addLine(`  • ${name}`, 10);
          });
        }
      }
      
      const travelDays = [];
      if (frame.outboundTravelDay) travelDays.push('Outbound');
      if (frame.inboundTravelDay) travelDays.push('Inbound');
      addLine(`Travel Days: ${travelDays.length > 0 ? travelDays.join(', ') : 'None'}`);
      
      addLine(`Per Diems: ${calc.perDiems} | Hotel Nights: ${calc.hotelNights}`);
      addLine(`Inner Trips: ${calc.innerTrips} | Outside Trips: ${calc.outsideTrips}`);
      yPosition += 5;
    });
    
    addSeparator();
  }

  // Labour Frames
  if (data.labourFrames.length > 0) {
    checkPageBreak();
    // Add gray background header
    pdf.setFillColor(245, 245, 245);
    pdf.rect(leftMargin, yPosition - 5, contentWidth, 15, 'F');
    addLine('Labour Time Frames', 14, true);
    
    data.labourFrames.forEach((frame, index) => {
      checkPageBreak();
      const calc = data.labourCalculations[index];
      
      addLine(`${frame.name}`, 12, true);
      addLine(`Dates: ${frame.outbound} to ${frame.inbound}`);
      addLine(`Labour Count: ${frame.count}`);
      
      if (frame.labourNames.length > 0) {
        const labourNamesList = frame.labourNames.filter(name => name.trim());
        if (labourNamesList.length > 0) {
          addLine(`Labour Names:`);
          labourNamesList.forEach(name => {
            addLine(`  • ${name}`, 10);
          });
        }
      }
      
      addLine(`Transport Mode: ${frame.mode}`);
      addLine(`Hotel Required: ${frame.hotelRequired ? 'Yes (Outside Dubai only)' : 'No'}`);
      addLine(`Per Diems: ${calc.perDiems} | Hotel Nights: ${calc.hotelNights}`);
      addLine(`Transport Trips: ${calc.transportTrips}`);
      yPosition += 5;
    });
    
    addSeparator();
  }

  // Summary Totals
  checkPageBreak();
  
  // Add gray background header
  pdf.setFillColor(245, 245, 245);
  pdf.rect(leftMargin, yPosition - 5, contentWidth, 20, 'F');
  
  addLine('Summary Totals', 16, true);
  yPosition += 5;
  
  checkPageBreak();
  addLine(`Total Per Diems: ${data.totals.totalPerDiems}`, 12, true);
  checkPageBreak();
  addLine(`Total Hotel Nights: ${data.totals.totalHotelNights}`, 12, true);
  checkPageBreak();
  addLine(`Total Inner City Trips: ${data.totals.totalInnerTrips}`, 12, true);
  checkPageBreak();
  addLine(`Total Outside City Trips: ${data.totals.totalOutsideTrips}`, 12, true);
  checkPageBreak();
  addLine(`Total Labour Transport Trips: ${data.totals.totalLabourTrips}`, 12, true);

  // Footer with page numbers and event name
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    const footerY = pdf.internal.pageSize.height - 15;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Left side: Generated date and event name
    pdf.text(`Generated on ${new Date().toLocaleString()} | ${data.eventName || 'Untitled Event'}`, leftMargin, footerY);
    
    // Right side: Page numbers
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin - 30, footerY);
  }

  // Save the PDF
  const fileName = `${data.eventName || 'Event'}_Calculator_Report.pdf`;
  pdf.save(fileName);
}