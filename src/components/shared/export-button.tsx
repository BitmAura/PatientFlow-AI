import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  onExport: (format: 'excel' | 'csv' | 'pdf') => void
  isLoading?: boolean
  formats?: ('excel' | 'csv' | 'pdf')[]
  label?: string
}

export function ExportButton({ 
  onExport, 
  isLoading, 
  formats = ['excel', 'csv', 'pdf'],
  label = 'Export'
}: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes('excel') && (
          <DropdownMenuItem onClick={() => onExport('excel')}>
            Export to Excel
          </DropdownMenuItem>
        )}
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => onExport('csv')}>
            Export to CSV
          </DropdownMenuItem>
        )}
        {formats.includes('pdf') && (
          <DropdownMenuItem onClick={() => onExport('pdf')}>
            Export to PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
