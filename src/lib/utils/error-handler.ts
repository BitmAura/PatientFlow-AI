import { ZodError } from 'zod'

export function handleApiError(error: unknown): { message: string, status: number } {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return {
      message: 'Validation failed: ' + error.errors.map(e => e.message).join(', '),
      status: 400
    }
  }

  if (error instanceof Error) {
    // Supabase errors often come as objects with code/message
    if ((error as any).code === 'PGRST116') {
      return { message: 'Resource not found', status: 404 }
    }
    return { message: error.message, status: 500 }
  }

  return { message: 'An unexpected error occurred', status: 500 }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

export function isSupabaseError(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && 'details' in error
}

export function logError(error: unknown, context?: object): void {
  // In production, send to Sentry/LogRocket
  console.error('Logged Error:', { error, context })
}
