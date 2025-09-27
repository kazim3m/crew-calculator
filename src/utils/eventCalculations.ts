import { EventLocation, LabourMode, CrewFrame, LabourFrame, CrewCalculation, LabourCalculation } from '@/types/eventCalculator';

export function daysBetween(outbound: string, inbound: string): number {
  const outDate = new Date(outbound);
  const inDate = new Date(inbound);
  const diffTime = inDate.getTime() - outDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : 0;
}

export function carsNeeded(count: number): number {
  return Math.ceil(count / 2);
}

export function calculateCrewFrame(frame: CrewFrame, location: EventLocation): CrewCalculation {
  // If no crew members are specified, return zero values
  if (frame.count <= 0) {
    return {
      perDiems: 0,
      hotelNights: 0,
      innerTrips: 0,
      outsideTrips: 0,
    };
  }
  
  const totalDays = daysBetween(frame.outbound, frame.inbound);
  
  // 1. Per Diems = totalDays (Inbound – Outbound + 1)
  // Travel day checkboxes do NOT affect this.
  const perDiems = totalDays;
  
  // 2. Hotel Nights = Only for Outside Dubai events
  // Travel day checkboxes do NOT affect this.
  const hotelNights = location === 'Outside Dubai' ? Math.max(totalDays - 1, 0) : 0;
  
  // 3. Inner City Trips - Location-based logic
  let innerTrips = 0;
  
  if (location === 'Dubai') {
    // DUBAI EVENTS: Simple inner city trips (no hotels involved)
    // Each day = 2 inner trips per crew (home ↔ venue)
    innerTrips = totalDays * 2 * frame.count;
    
    // Reduce if travel days are checked (crew stays home those days)
    if (frame.outboundTravelDay) {
      innerTrips -= 2 * frame.count;
    }
    if (frame.inboundTravelDay) {
      innerTrips -= 2 * frame.count;
    }
  } else {
    // OUTSIDE DUBAI EVENTS: Hotel-based trips
    if (totalDays === 1) {
      // Single day event
      if (!frame.outboundTravelDay && !frame.inboundTravelDay) {
        innerTrips = 1 * frame.count;  // venue → hotel or similar
      }
    } else if (totalDays === 2) {
      // Two day event: Day 1 + Day 2
      // Day 1: venue → hotel (if not outbound travel day)
      if (!frame.outboundTravelDay) {
        innerTrips += 1 * frame.count;
      }
      // Day 2: hotel → venue (if not inbound travel day)
      if (!frame.inboundTravelDay) {
        innerTrips += 1 * frame.count;
      }
    } else {
      // Multi-day event (3+ days)
      // Day 1: venue → hotel (if not outbound travel day)
      if (!frame.outboundTravelDay) {
        innerTrips += 1 * frame.count;
      }
      // Middle days (day 2 to day N-1): hotel → venue + venue → hotel = 2 trips each
      const middleDays = totalDays - 2;
      innerTrips += middleDays * 2 * frame.count;
      // Last day: hotel → venue (if not inbound travel day)
      if (!frame.inboundTravelDay) {
        innerTrips += 1 * frame.count;
      }
    }
  }
  
  // Ensure never negative
  innerTrips = Math.max(innerTrips, 0);
  
  // 4. Outside City Trips - Only for Outside Dubai events
  const outsideTrips = location === 'Outside Dubai' ? 2 : 0;

  return {
    perDiems,
    hotelNights,
    innerTrips,
    outsideTrips,
  };
}

export function calculateLabourFrame(frame: LabourFrame, location: EventLocation): LabourCalculation {
  // If no labour members are specified, return zero values
  if (frame.count <= 0) {
    return {
      perDiems: 0,
      hotelNights: 0,
      transportTrips: 0,
    };
  }
  
  const days = daysBetween(frame.outbound, frame.inbound);
  
  // 1. Per Diems = days × labourCount
  const perDiems = days * frame.count;
  
  // 2. Transport Trips
  const vansNeeded = Math.ceil(frame.count / 5);
  let transportTrips = 0;
  
  if (frame.mode === 'Labour Transport (2-way)') {
    // Mode 'Labour Transport (2-way)': transportTrips = days × 2 × vansNeeded
    transportTrips = days * 2 * vansNeeded;
  } else if (frame.mode === 'Truck In, Labour Transport Out') {
    // Mode 'Truck In, Labour Transport Out': transportTrips = vansNeeded
    transportTrips = vansNeeded;
  } else if (frame.mode === 'Truck (No Trip)') {
    // Mode 'Truck (No Trip)': transportTrips = 0
    transportTrips = 0;
  }
  
  // 3. Hotel Nights
  let hotelNights = 0;
  if (frame.hotelRequired && location === 'Outside Dubai' && days > 0) {
    hotelNights = Math.max((days - 1) * frame.count, 0);
  }

  return {
    perDiems,
    hotelNights,
    transportTrips,
  };
}
