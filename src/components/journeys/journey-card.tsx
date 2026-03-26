
import { useState } from 'react';
import { StuckJourney } from '@/types/journeys';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, CheckCircle, XCircle, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JourneyStaffService } from '@/services/journey-staff-service';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JourneyCardProps {
  journey: StuckJourney;
  currentUserId: string;
  onActionComplete: () => void;
}

export function JourneyCard({ journey, currentUserId, onActionComplete }: JourneyCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'call_patient' | 'mark_pending' | 'advance_stage' | 'drop_patient' | 'snooze') => {
    try {
      setLoading(true);
      await JourneyStaffService.performAction(
        journey.journey_id,
        journey.stage_id,
        action,
        currentUserId
      );
      toast.success('Action recorded successfully');
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high_risk': return 'destructive'; // Red
      case 'mild': return 'warning'; // Yellow/Orange - usually we'd need a custom variant or use 'secondary'
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">{journey.patient_name}</CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> {journey.patient_phone}
            </div>
          </div>
          <Badge variant={journey.delay_status === 'high_risk' ? 'destructive' : 'secondary'}>
            {journey.delay_status === 'high_risk' ? 'High Risk' : 'Mild Delay'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stuck In:</span>
            <span className="font-medium">{journey.stage_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overdue:</span>
            <span className="font-medium text-amber-600">
              {journey.days_overdue} days
            </span>
          </div>
          {!journey.automation_enabled && (
             <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
               <AlertTriangle className="h-3 w-3" />
               Automation Paused
             </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = `tel:${journey.patient_phone}`}
        >
          <Phone className="h-4 w-4 mr-1" />
          Call
        </Button>
        
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             size="sm"
             disabled={loading}
             onClick={() => handleAction('snooze')}
           >
             <Clock className="h-4 w-4 mr-1" />
             Snooze
           </Button>
           
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" disabled={loading}>
                 <MoreHorizontal className="h-4 w-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => handleAction('advance_stage')}>
                 <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                 Advance Stage
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleAction('drop_patient')} className="text-red-600">
                 <XCircle className="h-4 w-4 mr-2" />
                 Drop Patient
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
