import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CrewFrame, LabourFrame, TotalCalculation } from "@/types/eventCalculator";

export const exportToPDF = (
  crewFrames: CrewFrame[],
  labourFrames: LabourFrame[],
  totals: TotalCalculation,
  projectName: string,
  location: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Project: ${projectName}`, 14, 20);
  doc.text(`Location: ${location}`, 14, 30);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 40);

  autoTable(doc, {
    startY: 50,
    head: [[
      "Type",
      "Frame Name",
      "Outbound",
      "Inbound",
      "Crew Name",
      "Crew Count",
      "Per Diems",
      "Inner Trips",
      "Outside Trips",
      "Labour Transport Trips",
      "Hotel Nights",
      "Hotel Dates"
    ]],
    body: [
      ...crewFrames.flatMap(frame =>
        frame.crews.map(c => [
          "Crew",
          frame.frameName,
          frame.outbound,
          frame.inbound,
          c.name,
          c.count,
          c.perDiem,
          frame.innerCityTrips || "",
          frame.outsideCityTrips || "",
          "-",
          c.hotelNights || "",
          c.hotelDates || ""
        ])
      ),
      ...labourFrames.flatMap(frame =>
        frame.labour.map(l => [
          "Labour",
          frame.frameName,
          frame.outbound,
          frame.inbound,
          l.name,
          l.count,
          l.perDiem || "",
          frame.innerCityTrips || "",
          frame.outsideCityTrips || "",
          l.transportTrips || "",
          l.hotelNights || "",
          l.hotelDates || ""
        ])
      ),
      [
        "TOTALS",
        "",
        "",
        "",
        "",
        totals.totalCrewCount,
        totals.totalPerDiems,
        totals.totalInnerCityTrips,
        totals.totalOutsideCityTrips,
        totals.totalLabourTransportTrips,
        totals.totalHotelNights,
        ""
      ]
    ],
  });

  doc.save(`${projectName}_Crew_Calculator.pdf`);
};

export const exportToExcel = async (
  crewFrames: CrewFrame[],
  labourFrames: LabourFrame[],
  totals: TotalCalculation,
  projectName: string,
  location: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Crew Calculator");

  // Header section
  worksheet.addRow([`Project: ${projectName}`]);
  worksheet.addRow([`Location: ${location}`]);
  worksheet.addRow([`Export Date: ${new Date().toLocaleDateString("en-CA")}`]); // yyyy-mm-dd
  worksheet.addRow([]); // Blank row

  // Table headers
  const headerRow = worksheet.addRow([
    "Type",
    "Frame Name",
    "Outbound",
    "Inbound",
    "Crew Name",
    "Crew Count",
    "Per Diems",
    "Inner Trips",
    "Outside Trips",
    "Labour Transport Trips",
    "Hotel Nights",
    "Hotel Dates"
  ]);

  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });

  let currentRow = worksheet.lastRow!.number + 1;

  // Helper to insert frame rows and merge Type/FrameName
  const insertFrame = (
    type: string,
    frameName: string,
    outbound: string,
    inbound: string,
    members: { name: string; count: number; perDiem?: number; transportTrips?: number; hotelNights?: number; hotelDates?: string }[],
    innerTrips?: number,
    outsideTrips?: number
  ) => {
    const startRow = currentRow;

    members.forEach((m, idx) => {
      const row = worksheet.addRow([
        type,
        frameName,
        outbound,
        inbound,
        m.name,
        m.count,
        m.perDiem || "",
        idx === 0 ? innerTrips || "" : "",
        idx === 0 ? outsideTrips || "" : "",
        m.transportTrips ?? "-",
        m.hotelNights || "",
        m.hotelDates || ""
      ]);
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
      currentRow++;
    });

    const endRow = currentRow - 1;
    if (endRow > startRow) {
      worksheet.mergeCells(`A${startRow}:A${endRow}`); // Type
      worksheet.mergeCells(`B${startRow}:B${endRow}`); // Frame Name
      worksheet.mergeCells(`C${startRow}:C${endRow}`); // Outbound
      worksheet.mergeCells(`D${startRow}:D${endRow}`); // Inbound
    }
  };

  // Add crew frames
  crewFrames.forEach(frame => {
    insertFrame(
      "Crew",
      frame.frameName,
      frame.outbound,
      frame.inbound,
      frame.crews.map(c => ({
        name: c.name,
        count: c.count,
        perDiem: c.perDiem,
        hotelNights: c.hotelNights,
        hotelDates: c.hotelDates
      })),
      frame.innerCityTrips,
      frame.outsideCityTrips
    );
  });

  // Add labour frames
  labourFrames.forEach(frame => {
    insertFrame(
      "Labour",
      frame.frameName,
      frame.outbound,
      frame.inbound,
      frame.labour.map(l => ({
        name: l.name,
        count: l.count,
        perDiem: l.perDiem,
        transportTrips: l.transportTrips,
        hotelNights: l.hotelNights,
        hotelDates: l.hotelDates
      })),
      frame.innerCityTrips,
      frame.outsideCityTrips
    );
  });

  // Totals row
  const totalRow = worksheet.addRow([
    "TOTALS",
    "",
    "",
    "",
    "",
    totals.totalCrewCount,
    totals.totalPerDiems,
    totals.totalInnerCityTrips,
    totals.totalOutsideCityTrips,
    totals.totalLabourTransportTrips,
    totals.totalHotelNights,
    ""
  ]);

  totalRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });

  // Column widths
  worksheet.columns = [
    { width: 12 },
    { width: 22 },
    { width: 12 },
    { width: 12 },
    { width: 28 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 20 },
    { width: 14 },
    { width: 22 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${projectName}_Crew_Calculator.xlsx`);
};
