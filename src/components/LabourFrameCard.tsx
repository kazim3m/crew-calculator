import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, HardHat, Calendar, Bed, Truck, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { LabourFrame, LabourMode, LabourCalculation } from '@/types/eventCalculator';
import { NameInputs } from './NameInputs';
import { useState } from 'react';

interface LabourFrameCardProps {
  frame: LabourFrame;
  calculation: LabourCalculation;
  index: number;
  onUpdate: (updatedFrame: LabourFrame) => void;
  onRemove: () => void;
}

const labourModes: LabourMode[] = ['Labour Transport (2-way)', 'Truck In, Labour Transport Out', 'Truck (No Trip)'];

export function LabourFrameCard({ frame, calculation, index, onUpdate, onRemove }: LabourFrameCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleChange = (field: keyof LabourFrame, value: any) => {
    onUpdate({ ...frame, [field]: value });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold p-0 h-auto">
                <HardHat className="w-5 h-5 text-primary" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor={`labour-out-${frame.id}`}>Outbound Date</Label>
                <Input
                  id={`labour-out-${frame.id}`}
                  type="date"
                  value={frame.outbound}
                  onChange={(e) => handleChange('outbound', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`labour-in-${frame.id}`}>Inbound Date</Label>
                <Input
                  id={`labour-in-${frame.id}`}
                  type="date"
                  value={frame.inbound}
                  onChange={(e) => handleChange('inbound', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`labour-count-${frame.id}`}>Labour Count</Label>
                <Input
                  id={`labour-count-${frame.id}`}
                  type="number"
                  min="0"
                  value={frame.count}
                  onChange={(e) => handleChange('count', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Transport Mode</Label>
                <Select
                  value={frame.mode}
                  onValueChange={(value: LabourMode) => handleChange('mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {labourModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Labour Names */}
            <NameInputs
              names={frame.labourNames}
              count={frame.count}
              onNamesChange={(names) => handleChange('labourNames', names)}
              label="Labour Names"
            />

            {/* Hotel Required Flag */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`hotel-required-${frame.id}`}
                  checked={frame.hotelRequired}
                  onCheckedChange={(checked) => handleChange('hotelRequired', checked)}
                />
                <Label htmlFor={`hotel-required-${frame.id}`} className="text-sm flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  Hotel Required (Outside Dubai events only)
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
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
                <Truck className="w-5 h-5 mx-auto mb-2 text-success" />
                <div className="font-semibold text-lg text-foreground">{calculation.transportTrips}</div>
                <div className="text-xs text-muted-foreground">Transport Trips</div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}