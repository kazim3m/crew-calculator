import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Users, Calendar, Bed, Car, MapPin, Edit3, ChevronDown, ChevronUp, Plane } from 'lucide-react';
import { CrewFrame, EventLocation, CrewCalculation } from '@/types/eventCalculator';
import { NameInputs } from './NameInputs';
import { useState } from 'react';

interface CrewFrameCardProps {
  frame: CrewFrame;
  calculation: CrewCalculation;
  location: EventLocation;
  index: number;
  onUpdate: (updatedFrame: CrewFrame) => void;
  onRemove: () => void;
}

export function CrewFrameCard({ frame, calculation, index, onUpdate, onRemove }: CrewFrameCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  
  const handleChange = (field: keyof CrewFrame, value: any) => {
    onUpdate({ ...frame, [field]: value });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold p-0 h-auto">
                <Users className="w-5 h-5 text-primary" />
                <div className="relative flex items-center gap-2 flex-1">
                  <Input
                    value={frame.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-transparent border-none p-0 h-auto text-lg font-semibold focus:ring-0 focus:border-none"
                    placeholder="Frame Name"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Edit3 className="w-4 h-4 text-muted-foreground opacity-60" />
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`crew-out-${frame.id}`}>Outbound Date</Label>
                <Input
                  id={`crew-out-${frame.id}`}
                  type="date"
                  min={today}
                  value={frame.outbound}
                  onChange={(e) => handleChange('outbound', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`crew-in-${frame.id}`}>Inbound Date</Label>
                <Input
                  id={`crew-in-${frame.id}`}
                  type="date"
                  min={frame.outbound || today}
                  value={frame.inbound}
                  onChange={(e) => handleChange('inbound', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`crew-count-${frame.id}`}>Crew Count</Label>
                <Input
                  id={`crew-count-${frame.id}`}
                  type="number"
                  min="0"
                  value={frame.count}
                  onChange={(e) => handleChange('count', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Crew Names */}
            <NameInputs
              names={frame.crewNames}
              count={frame.count}
              onNamesChange={(names) => handleChange('crewNames', names)}
              label="Crew Names"
            />

            {/* Travel Day Flags */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Travel Day Settings
              </Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`outbound-travel-${frame.id}`}
                    checked={frame.outboundTravelDay}
                    onCheckedChange={(checked) => handleChange('outboundTravelDay', checked)}
                  />
                  <Label htmlFor={`outbound-travel-${frame.id}`} className="text-sm">
                    Outbound Day is Travel Day
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`inbound-travel-${frame.id}`}
                    checked={frame.inboundTravelDay}
                    onCheckedChange={(checked) => handleChange('inboundTravelDay', checked)}
                  />
                  <Label htmlFor={`inbound-travel-${frame.id}`} className="text-sm">
                    Inbound Day is Travel Day
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="font-semibold text-lg text-foreground">{calculation.perDiems}</div>
                <div className="text-xs text-muted-foreground">Per Diems</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <Bed className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold text-lg text-foreground">{calculation.hotelNights}</div>
                <div className="text-xs text-muted-foreground">Hotel Nights</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <Car className="w-5 h-5 mx-auto mb-2 text-success" />
                <div className="font-semibold text-lg text-foreground">{calculation.innerTrips}</div>
                <div className="text-xs text-muted-foreground">Inner City Trips</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <MapPin className="w-5 h-5 mx-auto mb-2 text-warning" />
                <div className="font-semibold text-lg text-foreground">{calculation.outsideTrips}</div>
                <div className="text-xs text-muted-foreground">Outside City Trips</div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}