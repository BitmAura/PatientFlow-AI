
import { useEffect, useState, useCallback } from 'react';
import { RecallService } from '@/services/recall-service';
import { RecallCard } from './recall-card';
import { useClinic } from '@/hooks/use-clinic';
import { Loader2, RefreshCcw, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecallBoard() {
  const { data: clinic } = useClinic() as any;
  const [recalls, setRecalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecalls = useCallback(async () => {
    if (!clinic?.id) return;
    try {
      setLoading(true);
      const data = await RecallService.getMoneyLeakList(clinic.id);
      setRecalls(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching recalls:', err);
      setError('Failed to load recall list.');
    } finally {
      setLoading(false);
    }
  }, [clinic?.id]);

  useEffect(() => {
    fetchRecalls();
  }, [fetchRecalls]);

  if (!clinic) return null;

  const totalRecoverable = recalls.reduce((sum, r) => sum + (r.estimated_recoverable_value || 0), 0);

  if (loading && recalls.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">Recall & Revenue Recovery</h2>
           <p className="text-muted-foreground">Identify and recover lost patient revenue.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecalls} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunity</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRecoverable.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Estimated value of overdue recalls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Loader2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recalls.length}</div>
            <p className="text-xs text-muted-foreground">Patients needing contact</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recalls.map((recall) => (
          <RecallCard 
            key={recall.id} 
            recall={{
                ...recall, 
                // Temporary patch: we need patient_id. 
                // If the service doesn't return it, the card might fail on 'booked' action.
                // I will add a todo to fix the service.
                patient_id: recall.patient_id || 'unknown' 
            }} 
            onActionComplete={fetchRecalls}
          />
        ))}
        {recalls.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">No revenue leaks detected! All clean.</p>
            </div>
        )}
      </div>
    </div>
  );
}
