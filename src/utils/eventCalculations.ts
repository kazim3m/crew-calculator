import { CrewFrame, CrewCalculation, LabourFrame, LabourCalculation, EventLocation } from "@/types/eventCalculator";

// -------------------
// Helper Functions
// -------------------
function daysBetween(outbound: string, inbound: string): number {
  if (!outbound || !inbound) return 0;
  const out = new Date(outbound);
  const inn = new Date(inbound);
  const diff = Math.floor((inn.getTime() - out.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0; // inclusive
}

function carsNeeded(count: number): number {
  return Math.ceil(count / 2); // 2 crew per car
}

// Calculate total cars needed across all crew frames based on car sharing requirements
export function calculateTotalCarsNeeded(crewFrames: CrewFrame[]): number {
  // Group crew by outbound date
  const crewByDate = new Map<string, number>();
  
  crewFrames.forEach(frame => {
    if (frame.count > 0) {
      const currentCount = crewByDate.get(frame.outbound) || 0;
      crewByDate.set(frame.outbound, currentCount + frame.count);
    }
  });
  
  // Calculate cars needed for each date and sum them up
  let totalCars = 0;
  crewByDate.forEach((crewCount) => {
    totalCars += carsNeeded(crewCount);
  });
  
  return totalCars;
}

// -------------------
// Crew Calculation
// -------------------
export function calculateCrewFrame(frame: CrewFrame, location: EventLocation): CrewCalculation {
  const totalDays = daysBetween(frame.outbound, frame.inbound);

  // 1. Per Diems (per person per day)
  const perDiems = totalDays * frame.count;

  // 2. Hotel Nights (only for Outside Dubai)
  const hotelNights = location === 'Outside Dubai' ? Math.max((totalDays - 1) * frame.count, 0) : 0;

  // 3. Calculate trips
  let innerTrips = 0;
  let outsideTrips = 0;
  
  const cars = carsNeeded(frame.count);

  if (location === "Dubai") {
    // Dubai: 2 trips per day × cars (travel flags don't affect Dubai)
    // Day 1: home→venue (1) + venue→home (1) = 2 trips
    // Day 2: home→venue (1) + venue→home (1) = 2 trips
    innerTrips = totalDays * 2 * cars;
    outsideTrips = 0;
  } else if (location === "Outside Dubai") {
    // Outside Dubai: venue↔hotel trips + travel day reductions
    outsideTrips = 2 * cars; // Dubai→venue (1) + venue→Dubai (1)
    
    if (totalDays === 1) {
      // Single day: no hotel trips needed
      innerTrips = 0;
    } else {
      // Multi-day Outside Dubai: venue↔hotel trips
      // Each evening (except last): venue→hotel = (totalDays - 1) trips
      // Each morning (except first): hotel→venue = (totalDays - 1) trips  
      // Total: 2 * (totalDays - 1) trips
      // For 2 days: 2 * (2-1) = 2 trips ✓
      // For 3 days: 2 * (3-1) = 4 trips ✓
      innerTrips = 2 * Math.max(totalDays - 1, 0) * cars;
      
      // Reduce by 1 trip per travel day flag
      if (frame.outboundTravelDay) {
        innerTrips = Math.max(innerTrips - cars, 0);
      }
      if (frame.inboundTravelDay) {
        innerTrips = Math.max(innerTrips - cars, 0);
      }
    }
  }

  return {
    perDiems,
    hotelNights,
    innerTrips,
    outsideTrips,
  };
}

// -------------------
// Labour Calculation
// -------------------
export function calculateLabourFrame(frame: LabourFrame, location: EventLocation): LabourCalculation {
  const days = daysBetween(frame.outbound, frame.inbound);
  const vansNeeded = Math.ceil(frame.count / 5); // 5 labourers per van

  // 1. Per Diems (same logic as crew - per person per day)
  const perDiems = days * frame.count;

  // 2. Transport Trips (based on van capacity and mode)
  let transportTrips = 0;
  if (frame.count > 0) {
    if (frame.mode === "Labour Transport (2-way)") {
      // Always 2 trips per day (inbound + outbound), van capacity = 5
      transportTrips = 2 * days * vansNeeded;
    } else if (frame.mode === "Truck In, Labour Transport Out") {
      // Labour comes with truck, goes back by van - 1 trip per van
      transportTrips = vansNeeded;
    } else if (frame.mode === "Truck (No Trip)") {
      // Came with truck, goes back with truck - no van trips
      transportTrips = 0;
    }
  }

  // 3. Hotel Nights (only when hotel required is checked AND Outside Dubai)
  let hotelNights = 0;
  if (frame.hotelRequired && location === "Outside Dubai" && days > 0) {
    hotelNights = (days - 1) * frame.count;
  }

  return {
    perDiems,
    hotelNights,
    transportTrips,
  };
}
