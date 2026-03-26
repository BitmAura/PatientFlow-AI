
import { useEffect, useState, useCallback } from 'react';
import { JourneyStaffService } from '@/services/journey-staff-service';
import { StuckJourney } from '@/types/journeys';
import { JourneyCard } from './journey-card';
import { useClinic } from '@/hooks/use-clinic';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function JourneyBoard() {
  const { data: clinic } = useClinic();
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<StuckJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = useCallback(async () => {
    if (!clinic?.id) return;
    try {
      setLoading(true);
      const data = await JourneyStaffService.getStuckJourneys(clinic.id);
      setJourneys(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching journeys:', err);
      setError('Failed to load stuck journeys. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clinic?.id]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  if (!clinic) return null;

  const highRisk = journeys.filter(j => j.delay_status === 'high_risk');
  const mild = journeys.filter(j => j.delay_status === 'mild');
  const other = journeys.filter(j => j.delay_status === 'none' || !j.delay_status);

  if (loading && journeys.length === 0) {
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
           <h2 className="text-2xl font-bold tracking-tight">Journey Command Center</h2>
           <p className="text-muted-foreground">Manage patients stuck in their treatment journey.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJourneys} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="high_risk" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="high_risk">High Risk ({highRisk.length})</TabsTrigger>
          <TabsTrigger value="mild">Mild Delay ({mild.length})</TabsTrigger>
          <TabsTrigger value="all">All ({journeys.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="high_risk" className="mt-6">
           <JourneyGrid journeys={highRisk} currentUserId={user?.id || ''} onRefresh={fetchJourneys} emptyMessage="No high-risk patients found. Great job!" />
        </TabsContent>
        
        <TabsContent value="mild" className="mt-6">
           <JourneyGrid journeys={mild} currentUserId={user?.id || ''} onRefresh={fetchJourneys} emptyMessage="No mild delays found." />
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
           <JourneyGrid journeys={journeys} currentUserId={user?.id || ''} onRefresh={fetchJourneys} emptyMessage="No stuck journeys found." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function JourneyGrid({ journeys, currentUserId, onRefresh, emptyMessage }: { journeys: StuckJourney[], currentUserId: string, onRefresh: () => void, emptyMessage: string }) {
  if (journeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {journeys.map((journey) => (
        <JourneyCard 
          key={`${journey.journey_id}-${journey.stage_id}`} 
          journey={journey} 
          currentUserId={currentUserId}
          onActionComplete={onRefresh}
        />
      ))}
    </div>
  );
}
