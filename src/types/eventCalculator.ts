export type EventLocation = 'Dubai' | 'Outside Dubai';
export type LabourMode = 'Labour Transport (2-way)' | 'Truck In, Labour Transport Out' | 'Truck (No Trip)';

export interface CrewFrame {
  id: string;
  name: string;
  outbound: string;
  inbound: string;
  count: number;
  crewNames: string[];
  outboundTravelDay: boolean;
  inboundTravelDay: boolean;
}

export interface LabourFrame {
  id: string;
  name: string;
  outbound: string;
  inbound: string;
  count: number;
  mode: LabourMode;
  labourNames: string[];
  hotelRequired: boolean;
}

export interface CrewCalculation {
  perDiems: number;
  hotelNights: number;
  innerTrips: number;
  outsideTrips: number;
}

export interface LabourCalculation {
  perDiems: number;
  hotelNights: number;
  transportTrips: number;
}

export interface TotalCalculation {
  totalPerDiems: number;
  totalHotelNights: number;
  totalInnerTrips: number;
  totalOutsideTrips: number;
  totalLabourTrips: number;
  totalCarsNeeded: number; // New field for cars needed based on crew sharing rules
}
