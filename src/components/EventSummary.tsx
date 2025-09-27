import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Bed, Car, MapPin, Truck, TrendingUp } from 'lucide-react';
import { TotalCalculation } from '@/types/eventCalculator';

interface EventSummaryProps {
  totals: TotalCalculation;
}

export function EventSummary({ totals }: EventSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Summary Totals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center p-6 bg-secondary/30 rounded-xl border border-border">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-primary" />
            <div className="text-2xl font-bold text-foreground">{totals.totalPerDiems}</div>
            <div className="text-sm text-muted-foreground">Total Per Diems</div>
          </div>
          
          <div className="text-center p-6 bg-secondary/30 rounded-xl border border-border">
            <Bed className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <div className="text-2xl font-bold text-foreground">{totals.totalHotelNights}</div>
            <div className="text-sm text-muted-foreground">Total Hotel Nights</div>
          </div>
          
          <div className="text-center p-6 bg-secondary/30 rounded-xl border border-border">
            <Car className="w-8 h-8 mx-auto mb-3 text-success" />
            <div className="text-2xl font-bold text-foreground">{totals.totalInnerTrips}</div>
            <div className="text-sm text-muted-foreground">Total Inner City Trips</div>
          </div>
          
          <div className="text-center p-6 bg-secondary/30 rounded-xl border border-border">
            <MapPin className="w-8 h-8 mx-auto mb-3 text-warning" />
            <div className="text-2xl font-bold text-foreground">{totals.totalOutsideTrips}</div>
            <div className="text-sm text-muted-foreground">Total Outside City Trips</div>
          </div>
          
          <div className="text-center p-6 bg-secondary/30 rounded-xl border border-border">
            <Truck className="w-8 h-8 mx-auto mb-3 text-info" />
            <div className="text-2xl font-bold text-foreground">{totals.totalLabourTrips}</div>
            <div className="text-sm text-muted-foreground">Labour Transport Trips</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}