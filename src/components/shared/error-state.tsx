import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorStateProps {
  title?: string
  error: string | Error
  retry?: () => void
}

export function ErrorState({ title = 'Something went wrong', error, retry }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <Alert variant="destructive" className="max-w-md text-left">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {errorMessage || 'An unexpected error occurred. Please try again later.'}
        </AlertDescription>
      </Alert>
      
      {retry && (
        <Button variant="outline" onClick={retry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
