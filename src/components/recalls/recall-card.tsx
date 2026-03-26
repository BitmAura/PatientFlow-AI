
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Calendar, DollarSign, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { RecallService } from '@/services/recall-service';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecallItemProps {
  recall: any; // Using any for now based on getMoneyLeakList return type
  onActionComplete: () => void;
}

export function RecallCard({ recall, onActionComplete }: RecallItemProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (outcome: 'booked' | 'not_interested' | 'call_later' | 'wrong_number') => {
    try {
      setLoading(true);
      await RecallService.processStaffOutcome(
        recall.id,
        recall.patient_id, // We need to ensure getMoneyLeakList returns this
        outcome
      );
      toast.success('Outcome recorded');
      onActionComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record outcome');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendReminder = async () => {
      try {
          setLoading(true);
          // In a real app, this would trigger the backend to send a message
          // For now we just log it as a manual action or use a service method if available
          // RecallService.safeSendRecall(recall.id, clinicId) is server-side usually?
          // Let's assume we have a client-safe way or just simulate for now
          toast.success('Reminder sent (simulated)');
          onActionComplete();
      } catch (error) {
          toast.error('Failed to send reminder');
      } finally {
          setLoading(false);
      }
  }

  return (
    <Card className="w-full border-l-4 border-l-blue-500">
      <CardContent className="pt-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{recall.patient_name}</h3>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Last Visit: {new Date(recall.last_visit).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-sm font-medium text-green-600 flex items-center justify-end">
               <DollarSign className="h-3 w-3" /> Est. {recall.estimated_recoverable_value}
             </div>
             <Badge variant="outline" className="mt-1">{recall.treatment}</Badge>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm mt-2 bg-slate-50 p-2 rounded">
           <span className="text-slate-600">Status: {recall.status}</span>
           <span className="font-medium text-red-500">{recall.days_overdue} days overdue</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-3">
        <Button variant="outline" size="sm" onClick={handleSendReminder} disabled={loading}>
          <MessageSquare className="h-4 w-4 mr-1" />
          Remind
        </Button>
        
        <div className="flex gap-2">
           <Button variant="default" size="sm" onClick={() => handleAction('booked')} disabled={loading} className="bg-green-600 hover:bg-green-700">
             <CheckCircle className="h-4 w-4 mr-1" />
             Booked
           </Button>
           
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" disabled={loading}>Actions</Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => handleAction('call_later')}>
                 Call Later
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleAction('not_interested')} className="text-red-600">
                 Not Interested
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleAction('wrong_number')} className="text-red-600">
                 Wrong Number
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
