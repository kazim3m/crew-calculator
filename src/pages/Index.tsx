import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calculator, MapPin, FileDown, FileSpreadsheet } from 'lucide-react';
import { CrewFrame, LabourFrame, EventLocation, TotalCalculation } from '@/types/eventCalculator';
import { calculateCrewFrame, calculateLabourFrame, calculateTotalCarsNeeded } from '@/utils/eventCalculations';
import { exportToPDF, exportToExcel } from '@/utils/pdfExport';
import { CrewFrameCard } from '@/components/CrewFrameCard';
import { LabourFrameCard } from '@/components/LabourFrameCard';
import { EventSummary } from '@/components/EventSummary';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [eventName, setEventName] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<EventLocation>('Dubai');
  const [crewFrames, setCrewFrames] = useState<CrewFrame[]>([
    { id: '1', name: 'Crew Frame 1', outbound: today, inbound: today, count: 0, crewNames: [], outboundTravelDay: false, inboundTravelDay: false }
  ]);
  const [labourFrames, setLabourFrames] = useState<LabourFrame[]>([
    { id: '1', name: 'Labour Frame 1', outbound: today, inbound: today, count: 0, mode: 'Labour Transport (2-way)', labourNames: [], hotelRequired: false }
  ]);
  const { toast } = useToast();

  const addCrewFrame = () => {
    const newFrame: CrewFrame = {
      id: Date.now().toString(),
      name: `Crew Frame ${crewFrames.length + 1}`,
      outbound: today,
      inbound: today,
      count: 0,
      crewNames: [],
      outboundTravelDay: false,
      inboundTravelDay: false,
    };
    setCrewFrames([...crewFrames, newFrame]);
    toast({
      title: "Crew frame added",
      description: "New crew frame has been added successfully.",
    });
  };

  const addLabourFrame = () => {
    const newFrame: LabourFrame = {
      id: Date.now().toString(),
      name: `Labour Frame ${labourFrames.length + 1}`,
      outbound: today,
      inbound: today,
      count: 0,
      mode: 'Labour Transport (2-way)',
      labourNames: [],
      hotelRequired: false,
    };
    setLabourFrames([...labourFrames, newFrame]);
    toast({
      title: "Labour frame added",
      description: "New labour frame has been added successfully.",
    });
  };

  const updateCrewFrame = (updatedFrame: CrewFrame) => {
    setCrewFrames(crewFrames.map(f => f.id === updatedFrame.id ? updatedFrame : f));
  };

  const updateLabourFrame = (updatedFrame: LabourFrame) => {
    setLabourFrames(labourFrames.map(f => f.id === updatedFrame.id ? updatedFrame : f));
  };

  const removeCrewFrame = (frameId: string) => {
    if (crewFrames.length > 1) {
      setCrewFrames(crewFrames.filter(f => f.id !== frameId));
      toast({
        title: "Crew frame removed",
        description: "Crew frame has been removed successfully.",
        variant: "destructive",
      });
    }
  };

  const removeLabourFrame = (frameId: string) => {
    if (labourFrames.length > 1) {
      setLabourFrames(labourFrames.filter(f => f.id !== frameId));
      toast({
        title: "Labour frame removed",
        description: "Labour frame has been removed successfully.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    exportToPDF({
      eventName,
      eventLocation,
      crewFrames,
      labourFrames,
      crewCalculations,
      labourCalculations,
      totals,
    });
    toast({
      title: "PDF Generated",
      description: "Event report has been exported successfully.",
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      eventName,
      eventLocation,
      crewFrames,
      labourFrames,
      crewCalculations,
      labourCalculations,
      totals,
    });
    toast({
      title: "Excel Generated",
      description: "Event report has been exported successfully.",
    });
  };

  // Calculate totals
  const crewCalculations = crewFrames.map(frame => calculateCrewFrame(frame, eventLocation));
  const labourCalculations = labourFrames.map(frame => calculateLabourFrame(frame, eventLocation));

  const totals: TotalCalculation = {
    totalPerDiems: crewCalculations.reduce((sum, calc) => sum + calc.perDiems, 0) +
                   labourCalculations.reduce((sum, calc) => sum + calc.perDiems, 0),
    totalHotelNights: crewCalculations.reduce((sum, calc) => sum + calc.hotelNights, 0) +
                      labourCalculations.reduce((sum, calc) => sum + calc.hotelNights, 0),
    totalInnerTrips: crewCalculations.reduce((sum, calc) => sum + calc.innerTrips, 0),
    totalOutsideTrips: crewCalculations.reduce((sum, calc) => sum + calc.outsideTrips, 0),
    totalLabourTrips: labourCalculations.reduce((sum, calc) => sum + calc.transportTrips, 0),
    totalCarsNeeded: calculateTotalCarsNeeded(crewFrames),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">3Monkeys Crew Calculator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate Per Diems, Hotel Nights, Transport for Crew and Labour
          </p>
        </div>

        {/* Event Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Event Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter event name"
                />
              </div>
              <div>
                <Label htmlFor="event-location">Event Location</Label>
                <Select value={eventLocation} onValueChange={(value: EventLocation) => setEventLocation(value)}>
                  <SelectTrigger id="event-location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dubai">Dubai</SelectItem>
                    <SelectItem value="Outside Dubai">Outside Dubai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crew Frames */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold">Crew Time Frames</h2>
            <Button onClick={addCrewFrame}>
              <Plus className="w-4 h-4 mr-2" />
              Add Time Frame
            </Button>
          </div>
          <div className="grid gap-6">
            {crewFrames.map((frame, index) => (
              <CrewFrameCard
                key={frame.id}
                frame={frame}
                calculation={crewCalculations[index]}
                location={eventLocation}
                index={index}
                onUpdate={updateCrewFrame}
                onRemove={() => removeCrewFrame(frame.id)}
              />
            ))}
          </div>
        </div>

        {/* Labour Frames */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold">Labour Time Frames</h2>
            <Button onClick={addLabourFrame}>
              <Plus className="w-4 h-4 mr-2" />
              Add Time Frame
            </Button>
          </div>
          <div className="grid gap-6">
            {labourFrames.map((frame, index) => (
              <LabourFrameCard
                key={frame.id}
                frame={frame}
                calculation={labourCalculations[index]}
                index={index}
                onUpdate={updateLabourFrame}
                onRemove={() => removeLabourFrame(frame.id)}
              />
            ))}
          </div>
        </div>

        {/* Summary */}
        <EventSummary totals={totals} />

        {/* Export Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleExportPDF} size="lg" className="gap-2">
            <FileDown className="w-5 h-5" />
            Export as PDF
          </Button>
          <Button onClick={handleExportExcel} size="lg" variant="outline" className="gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Export as Excel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
