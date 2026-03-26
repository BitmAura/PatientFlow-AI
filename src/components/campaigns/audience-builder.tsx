'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { usePreviewAudience } from '@/hooks/use-campaigns'
import { Loader2, Users } from 'lucide-react'
import { AudienceFilters } from '@/lib/validations/campaign'
import { AudiencePreviewDialog } from './audience-preview-dialog'

interface AudienceBuilderProps {
  type: string
  filters: AudienceFilters
  onFilterChange: (filters: AudienceFilters) => void
}

export function AudienceBuilder({ type, filters, onFilterChange }: AudienceBuilderProps) {
  const preview = usePreviewAudience()
  const [previewData, setPreviewData] = React.useState<{ count: number, sample: any[] } | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)

  const handlePreview = async () => {
    const data = await preview.mutateAsync({ type, filters })
    setPreviewData(data)
    setShowPreview(true)
  }

  const updateFilter = (key: keyof AudienceFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value })
    setPreviewData(null) // Reset preview when filters change
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Dynamic Inputs based on Type */}
          {type === 'checkup_reminder' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Patients who haven&apos;t visited in</Label>
                <Select 
                  value={filters.months_since_visit} 
                  onValueChange={(val) => updateFilter('months_since_visit', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === 'no_show_reengagement' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum No-Shows</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={filters.min_no_shows || ''}
                  onChange={(e) => updateFilter('min_no_shows', parseInt(e.target.value))}
                  placeholder="e.g. 1"
                />
              </div>
            </div>
          )}

          {/* Common Filters */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="opt-out" 
              checked={filters.exclude_opted_out}
              onCheckedChange={(c) => updateFilter('exclude_opted_out', c)}
            />
            <Label htmlFor="opt-out">Exclude patients who opted out of marketing</Label>
          </div>

          <div className="pt-4 border-t flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {previewData ? (
                <span className="font-medium text-green-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {previewData.count} patients match
                </span>
              ) : (
                'Preview to see audience size'
              )}
            </div>
            <Button onClick={handlePreview} disabled={preview.isPending} variant="outline">
              {preview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Preview Audience
            </Button>
          </div>
        </CardContent>
      </Card>

      <AudiencePreviewDialog 
        open={showPreview} 
        onOpenChange={setShowPreview}
        data={previewData}
      />
    </div>
  )
}
