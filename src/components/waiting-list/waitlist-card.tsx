import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WaitlistEntry } from "@/types/waiting-list"
import { Bell, Calendar, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface WaitlistCardProps {
  entry: WaitlistEntry
  onNotify: (entry: WaitlistEntry) => void
  onConvert: (entry: WaitlistEntry) => void
  onRemove: (id: string) => void
}

export function WaitlistCard({ entry, onNotify, onConvert, onRemove }: WaitlistCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {entry.patient?.full_name}
        </CardTitle>
        <Badge variant={entry.priority === 'high' ? 'destructive' : 'outline'}>
          {entry.priority}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{entry.service?.name}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Prefers: {format(new Date(entry.preferences.date_from), 'MMM d')} - {format(new Date(entry.preferences.date_to), 'MMM d')}
        </p>
        <div className="flex gap-2 mt-2">
            {entry.preferences.times?.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onRemove(entry.id)}>
            <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onNotify(entry)}>
                <Bell className="h-4 w-4 mr-1" /> Notify
            </Button>
            <Button size="sm" onClick={() => onConvert(entry)}>
                <Calendar className="h-4 w-4 mr-1" /> Book
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
